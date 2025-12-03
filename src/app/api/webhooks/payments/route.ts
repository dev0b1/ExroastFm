import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const headersList = await headers();
  const rawBody = await request.text();
  
  const webhookHeaders = {
    "webhook-id": headersList.get("webhook-id") || "",
    "webhook-signature": headersList.get("webhook-signature") || "",
    "webhook-timestamp": headersList.get("webhook-timestamp") || "",
  };

  try {
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!secret) {
      console.warn('[DodoWebhook] DODO_PAYMENTS_WEBHOOK_KEY not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const webhook = new Webhook(secret);
    // Verify webhook signature
    await webhook.verify(rawBody, webhookHeaders as any);
    const payload = JSON.parse(rawBody);
    
    // Handle different webhook events
    switch(payload.type) {
      case "payment.completed":
        await handlePaymentCompleted(payload.data);
        break;
      
      case "payment.failed":
        await handlePaymentFailed(payload.data);
        break;
      
      case "subscription.created":
        await handleSubscriptionCreated(payload.data);
        break;
      
      case "subscription.cancelled":
        await handleSubscriptionCancelled(payload.data);
        break;
      
      default:
        console.log("Unhandled webhook event:", payload.type);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handlePaymentCompleted(data: any) {
  console.log("Payment completed:", data);
  // TODO: Integrate with Drizzle DB and fulfillment logic
}

async function handlePaymentFailed(data: any) {
  console.log("Payment failed:", data);
  // TODO: Notify customer or mark order failed
}

async function handleSubscriptionCreated(data: any) {
  console.log("Subscription created:", data);
  // TODO: Create subscription record / grant access
}

async function handleSubscriptionCancelled(data: any) {
  console.log("Subscription cancelled:", data);
  // TODO: Revoke access and update records
}
