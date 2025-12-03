import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { db } from "@/server/db";
import { transactions, songs, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { refillCredits } from "@/lib/db-service";

// Simple Dodo webhook receiver.
// Expects header `x-dodo-signature` which is HMAC-SHA256 of raw body using
// the secret in `DODO_WEBHOOK_SECRET` env var.

export async function POST(request: NextRequest) {
  const sig = request.headers.get('x-dodo-signature') || '';
  const raw = await request.text();

  if (!sig || !raw) {
    console.error('[DodoWebhook] Missing signature or body');
    return NextResponse.json({ error: 'Missing signature or body' }, { status: 400 });
  }

  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[DodoWebhook] DODO_WEBHOOK_SECRET not configured');
    return NextResponse.json({ received: true, note: 'Secret not configured' });
  }

  try {
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))) {
      console.error('[DodoWebhook] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (e) {
    console.error('[DodoWebhook] Signature verification error', e);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    console.error('[DodoWebhook] Invalid JSON payload', e);
    return NextResponse.json({ received: true });
  }

  // payload structure is expected to include `event` and `data` fields
  const event = payload.event || payload.type || null;
  const data = payload.data || payload.transaction || payload;

  try {
    if (!data || !data.id) {
      console.error('[DodoWebhook] Missing transaction id');
      return NextResponse.json({ received: true });
    }

    const txId = String(data.id);

    // Prevent duplicates
    const existing = await db.select().from(transactions).where(eq(transactions.id, txId)).limit(1);
    if (existing.length > 0) {
      console.log(`[DodoWebhook] Transaction ${txId} already processed`);
      return NextResponse.json({ received: true });
    }

    // Insert transaction record
    await db.insert(transactions).values({
      id: txId,
      songId: data.custom_data?.songId || null,
      userId: data.custom_data?.userId || null,
      amount: data.amount || data.total || "0",
      currency: data.currency || data.currency_code || 'USD',
      status: data.status || event || 'unknown',
      paddleData: JSON.stringify(data),
    });

    // Handle completed-like events
    if (event === 'transaction.completed' || event === 'transaction.paid' || data.status === 'paid' || data.status === 'completed') {
      await handleTransactionCompleted(data);
    }

    // Subscription events (basic handling)
    if (event && event.toString().startsWith('subscription')) {
      // Basic subscription create/update/cancel handling
      const sub = data.subscription || data;
      const subEvent = event.toString();
      if (subEvent.includes('created') || subEvent.includes('activated')) {
        await handleSubscriptionCreated(sub);
      } else if (subEvent.includes('updated')) {
        await handleSubscriptionUpdated(sub);
      } else if (subEvent.includes('canceled')) {
        await handleSubscriptionCanceled(sub);
      }
    }

    console.log('[DodoWebhook] Processed event', event || data.status);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[DodoWebhook] Processing error', error);
    return NextResponse.json({ received: true, error: 'processing_error' });
  }
}

async function handleTransactionCompleted(transaction: any) {
  const custom = transaction.custom_data || {};
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
    const songResult = await db.select().from(songs).where(eq(songs.id, songId)).limit(1);
    if (songResult.length === 0) {
      console.error(`[DodoWebhook] Song ${songId} not found`);
      return;
    }
    const song = songResult[0];
    if (song.isPurchased) {
      console.log(`[DodoWebhook] Song ${songId} already purchased`);
      return;
    }

    await db.update(songs).set({
      isPurchased: true,
      purchaseTransactionId: transaction.id,
      userId: userId || song.userId,
      updatedAt: new Date()
    }).where(eq(songs.id, songId));

    console.log(`[DodoWebhook] Unlocked song ${songId} for transaction ${transaction.id}`);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.custom_data?.userId;
  if (!userId) return;
  const tier = subscription.custom_data?.tier || 'unlimited';
  let initialCredits = tier === 'unlimited' ? 20 : (tier === 'weekly' ? 3 : 0);

  await db.insert(subscriptions).values({
    userId,
    paddleSubscriptionId: subscription.id,
    tier,
    status: subscription.status || 'active',
    creditsRemaining: initialCredits,
    renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
  }).onConflictDoUpdate({
    target: subscriptions.userId,
    set: {
      paddleSubscriptionId: subscription.id,
      tier,
      status: subscription.status || 'active',
      creditsRemaining: initialCredits,
      renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
      updatedAt: new Date(),
    }
  });

  console.log(`[DodoWebhook] Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.custom_data?.userId;
  if (!userId) return;
  const tier = subscription.custom_data?.tier || 'unlimited';
  const status = subscription.status || 'active';

  await db.update(subscriptions).set({
    tier,
    status,
    renewsAt: subscription.next_billed_at ? new Date(subscription.next_billed_at) : null,
    updatedAt: new Date(),
  }).where(eq(subscriptions.paddleSubscriptionId, subscription.id));

  console.log(`[DodoWebhook] Subscription updated for user ${userId}`);
}

async function handleSubscriptionCanceled(subscription: any) {
  await db.update(subscriptions).set({ status: 'canceled', updatedAt: new Date() }).where(eq(subscriptions.paddleSubscriptionId, subscription.id));
  console.log(`[DodoWebhook] Subscription canceled: ${subscription.id}`);
}
