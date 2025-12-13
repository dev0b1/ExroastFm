import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { transactions, songs, subscriptions } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { refillCredits } from '@/lib/db-service';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const headersList = await headers();
  const rawBody = await request.text();
  
  const webhookHeaders = {
    "webhook-id": headersList.get("webhook-id") || "",
    "webhook-signature": headersList.get("webhook-signature") || "",
    "webhook-timestamp": headersList.get("webhook-timestamp") || "",
  };

  try {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY || process.env.DODO_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('[DodoWebhook] Webhook secret not configured (DODO_PAYMENTS_WEBHOOK_KEY or DODO_WEBHOOK_SECRET)');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Use the standardwebhooks/Webhook helper to verify the signature
    const webhook = new Webhook(secret);
    await webhook.verify(rawBody, webhookHeaders as any);

    const payload = JSON.parse(rawBody);

    // Normalize event name/location of data
    const event = payload.type || payload.event || payload.event_type || null;
    const data = payload.data || payload.transaction || payload;

    // Prevent duplicate processing by checking transaction id where available
    // Using try-catch on insert to handle race conditions
    if (data && data.id) {
      try {
        await db.insert(transactions).values({
          id: String(data.id),
          songId: data.custom_data?.songId || null,
          userId: data.custom_data?.userId || null,
          amount: data.amount || data.total || "0",
          currency: data.currency || data.currency_code || 'USD',
          status: data.status || event || 'unknown',
          providerData: JSON.stringify(data),
        });
      } catch (e: any) {
        // Check for duplicate key violation (Postgres code 23505)
        if (e.code === '23505' || e.message?.includes('unique constraint')) {
          console.log(`[DodoWebhook] Transaction ${data.id} already processed`);
          return NextResponse.json({ received: true });
        }
        console.error('[DodoWebhook] Failed to insert transaction:', e);
        // Don't throw - we want to return 200 to prevent retries
      }
    }

    // Handle specific events (transaction completed / subscription events)
    // Wrap in try-catch to prevent handler errors from causing webhook retries
    try {
      if (event === 'payment.completed' || event === 'transaction.completed' || data?.status === 'paid' || data?.status === 'completed') {
        await handleTransactionCompleted(data);
      }

      if (event && event.toString().includes('subscription')) {
        const subEvent = event.toString();
        if (subEvent.includes('created') || subEvent.includes('activated')) {
          await handleSubscriptionCreated(data);
        } else if (subEvent.includes('updated')) {
          await handleSubscriptionUpdated(data);
        } else if (subEvent.includes('cancelled') || subEvent.includes('canceled')) {
          await handleSubscriptionCanceled(data);
        } else if (subEvent.includes('paused')) {
          await handleSubscriptionPaused(data);
        } else if (subEvent.includes('expired') || subEvent.includes('past_due')) {
          await handleSubscriptionExpired(data);
        }
      }
    } catch (handlerError) {
      console.error('[DodoWebhook] Handler error:', handlerError);
      // Still return 200 to acknowledge receipt
    }

    console.log('[DodoWebhook] Processed event', event || data?.status);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook verification failed or processing error:', err);
    return new Response(JSON.stringify({ error: 'Invalid signature or processing error', details: err?.message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
}

async function handleTransactionCompleted(transaction: any) {
  try {
    await db.transaction(async (tx: any) => {
      const custom = transaction?.custom_data || {};
      const userId = custom.userId || null;

      if (custom.type === 'credit_purchase') {
        const credits = Number(custom.creditsAmount || transaction.creditsAmount || 0);
        if (userId && credits > 0) {
          await refillCredits(userId, credits);
          console.log(`[DodoWebhook] Refilled ${credits} credits for user ${userId}`);
        }
      }

      if (custom.songId) {
        const songId = custom.songId;
        const songResult = await tx.select().from(songs).where(eq(songs.id, songId)).limit(1);
        if (songResult.length === 0) {
          console.error(`[DodoWebhook] Song ${songId} not found`);
          return;
        }
        const song = songResult[0];
        if (song.isPurchased) {
          console.log(`[DodoWebhook] Song ${songId} already purchased`);
          return;
        }

        await tx.update(songs).set({
          isPurchased: true,
          purchaseTransactionId: transaction.id,
          userId: userId || song.userId,
          updatedAt: new Date()
        }).where(eq(songs.id, songId));

        console.log(`[DodoWebhook] Unlocked song ${songId} for transaction ${transaction.id}`);
      }

      // No pending purchase flow: we rely on `custom_data.songId` or transaction metadata to unlock items.
    });
  } catch (error) {
    console.error('[DodoWebhook] Error handling transaction completion:', error);
    throw error;
  }
}

// Read manifest of premium songs
async function readManifest(): Promise<any[]> {
  const manifestPath = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');
  const raw = await readFile(manifestPath, 'utf8');
  return JSON.parse(raw || '[]');
}

function scoreAndRank(items: any[], story?: string) {
  let results = items.map(i => ({ ...i, score: 0 }));
  if (typeof story === 'string' && story.trim().length > 0) {
    const s = story.toLowerCase();
    results = results.map(r => {
      const kws = (r.keywords || '').split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean);
      const score = kws.reduce((acc: number, k: string) => acc + (s.includes(k) ? 1 : 0), 0);
      return { ...r, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
    const matched = results.filter(r => (r.score || 0) > 0);
    if (matched.length > 0) results = matched;
  }
  return results;
}

// `fulfillPurchase` removed — pending purchase flow is no longer used. Webhook relies on `custom_data.songId` or manifest matching.

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.custom_data?.userId;
  if (!userId) {
    console.warn('[DodoWebhook] Subscription created without userId');
    return;
  }
  
  const tier = subscription.custom_data?.tier || 'unlimited';
  let initialCredits = tier === 'unlimited' ? 20 : (tier === 'weekly' ? 3 : 0);

  try {
    await db.insert(subscriptions).values({
      userId,
      dodoSubscriptionId: subscription.id,
      tier,
      status: subscription.status || 'active',
      creditsRemaining: initialCredits,
      renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
    }).onConflictDoUpdate({
      target: subscriptions.dodoSubscriptionId,
      set: {
        tier,
        status: subscription.status || 'active',
        creditsRemaining: initialCredits,
        renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
        updatedAt: new Date(),
      }
    });

    console.log(`[DodoWebhook] Subscription created for user ${userId} (${subscription.id})`);
  } catch (error) {
    console.error('[DodoWebhook] Error creating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.custom_data?.userId;
  if (!userId) {
    console.warn('[DodoWebhook] Subscription updated without userId');
    return;
  }
  
  const tier = subscription.custom_data?.tier || 'unlimited';
  const status = subscription.status || 'active';

  try {
    await db.update(subscriptions).set({
      tier,
      status,
      renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
      updatedAt: new Date(),
    }).where(eq(subscriptions.dodoSubscriptionId, subscription.id));

    console.log(`[DodoWebhook] Subscription updated for user ${userId} (${subscription.id})`);
  } catch (error) {
    console.error('[DodoWebhook] Error updating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  try {
    await db.update(subscriptions).set({ 
      status: 'canceled', 
      updatedAt: new Date() 
    }).where(eq(subscriptions.dodoSubscriptionId, subscription.id));
    
    console.log(`[DodoWebhook] Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('[DodoWebhook] Error canceling subscription:', error);
    throw error;
  }
}

async function handleSubscriptionPaused(subscription: any) {
  try {
    await db.update(subscriptions).set({ 
      status: 'paused', 
      updatedAt: new Date() 
    }).where(eq(subscriptions.dodoSubscriptionId, subscription.id));
    
    console.log(`[DodoWebhook] Subscription paused: ${subscription.id}`);
  } catch (error) {
    console.error('[DodoWebhook] Error pausing subscription:', error);
    throw error;
  }
}

async function handleSubscriptionExpired(subscription: any) {
  try {
    await db.update(subscriptions).set({ 
      status: 'expired', 
      updatedAt: new Date() 
    }).where(eq(subscriptions.dodoSubscriptionId, subscription.id));
    
    console.log(`[DodoWebhook] Subscription expired: ${subscription.id}`);
  } catch (error) {
    console.error('[DodoWebhook] Error expiring subscription:', error);
    throw error;
  }
}
