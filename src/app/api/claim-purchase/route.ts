import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { transactions, songs, subscriptions } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { mapPriceIdToAction } from '@/lib/paddle-config';
import { refillCredits } from '@/lib/db-service';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Claim purchases that were made while the user was logged out. We match
// transactions whose `providerData` contains the buyer email and which are not
// yet associated with a user. For each matched transaction we:
// - attach transactions.userId = provided userId
// - if it's a credits/subscription action, create/update the subscription row
//   and grant the correct number of credits
// - if it's a single-song purchase with songId, mark the song as purchased
// NOTE: This endpoint expects a POST with JSON { userId, email }.

export async function POST(request: NextRequest) {
	try {
		// Derive user from server-side session (cookies) rather than trusting client data
		const cookieStore = await cookies();
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					}
				}
			}
		);

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return NextResponse.json({ ok: false, message: 'Not authenticated' }, { status: 401 });
		}

		const userId = user.id;
		const email = (user.email || '').toString().trim().toLowerCase();

		if (!email || !userId) {
			return NextResponse.json({ ok: false, message: 'Invalid session' }, { status: 400 });
		}

		// Find transactions that appear to belong to this buyer (providerData contains email)
		const matches = await db.select().from(transactions).where(sql`provider_data ILIKE ${'%' + email + '%'} AND user_id IS NULL`);

		if (!matches || matches.length === 0) {
			return NextResponse.json({ ok: true, claimed: 0, message: 'No matching transactions' });
		}

		let claimed = 0;

		for (const tx of matches) {
			// defensive: skip if already claimed
			if (tx.userId) continue;

			let parsed: any = null;
			try { parsed = JSON.parse(tx.providerData); } catch (e) { parsed = null; }

			// try to extract price id similar to webhook
			let priceId: string | null = null;
			if (parsed) {
				if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
					priceId = parsed.items[0]?.price?.id || parsed.items[0]?.price_id || null;
				}
				priceId = priceId || parsed.price_id || parsed.product_id || parsed.plan_id || (parsed.checkout && parsed.checkout.price_id) || null;
			}

			const priceAction = mapPriceIdToAction(priceId || undefined);

			// If mapping suggests a subscription/credits, create or refill subscription
			if (priceAction) {
				if (priceAction.kind === 'credits' || priceAction.tier === 'one-time') {
					const credits = Number(priceAction.creditsAmount || 0) || 1;
					const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
					if (sub && sub.length > 0) {
						await refillCredits(userId, credits);
					} else {
						await db.insert(subscriptions).values({ userId, tier: priceAction.tier || 'one-time', status: 'active', creditsRemaining: credits });
					}
				} else if (priceAction.kind === 'subscription' && priceAction.tier === 'weekly') {
					const initialCredits = Number(priceAction.creditsAmount || 3);
					const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
					if (sub && sub.length > 0) {
						await refillCredits(userId, initialCredits);
						await db.update(subscriptions).set({ tier: 'weekly', status: 'active', updatedAt: new Date() }).where(eq(subscriptions.userId, userId));
					} else {
						await db.insert(subscriptions).values({ userId, tier: 'weekly', status: 'active', creditsRemaining: initialCredits });
					}
				} else if (priceAction.kind === 'purchase') {
					if (tx.songId) {
						await db.update(songs).set({ isPurchased: true, purchaseTransactionId: tx.id, userId }).where(eq(songs.id, tx.songId));
					}
					const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
					if (sub && sub.length > 0) {
						await refillCredits(userId, 1);
					} else {
						await db.insert(subscriptions).values({ userId, tier: 'one-time', status: 'active', creditsRemaining: 1 });
					}
				}
			} else {
				if (tx.songId) {
					await db.update(songs).set({ isPurchased: true, purchaseTransactionId: tx.id, userId }).where(eq(songs.id, tx.songId));
				}
			}

			await db.update(transactions).set({ userId }).where(eq(transactions.id, tx.id));
			claimed++;
		}

		return NextResponse.json({ ok: true, claimed });
	} catch (err) {
		console.error('Claim purchase error', err);
		return NextResponse.json({ ok: false, message: 'Internal error' }, { status: 500 });
	}
}
