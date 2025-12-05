"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SINGLE_AMOUNT } from '@/lib/pricing';
import * as DodoPaymentsPkg from 'dodopayments-checkout';

interface SingleCheckoutOpts {
  songId?: string | null;
}

interface IntendedPurchase {
  type: 'single' | 'tier';
  songId?: string | null;
  tierId?: string;
  priceId?: string | null;
  ts: number;
}

// Helper to safely access localStorage
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to set localStorage key: ${key}`, e);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove localStorage key: ${key}`, e);
    }
  }
};

// Helper to resolve user session with fallback
async function resolveUser() {
  const supabase = createClientComponentClient();
  
  // First try the client-side SDK (this will be populated when the client
  // has a local session / tokens in browser storage).
  try {
    const { data } = await supabase.auth.getSession();
    const sessionData = (data as any)?.session;
    const userFromSession = sessionData?.user;
    if (userFromSession) return userFromSession;
  } catch (e) {
    console.debug('[resolveUser] supabase.auth.getSession() failed', e);
  }

  // If the client SDK doesn't have a user (common when tokens are stored as
  // httpOnly cookies by server-side exchanges), fall back to asking the server
  // for the current session. This keeps behaviour consistent with middleware
  // which uses server-side cookie-based auth.
  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      const body = await res.json();
      if (body?.user) return body.user;
    }
  } catch (e) {
    console.debug('[resolveUser] /api/session fetch failed', e);
  }

  // As a last-ditch attempt, ask the client SDK for the user object.
  try {
    const { data: { user: clientUser } } = await supabase.auth.getUser();
    return clientUser || null;
  } catch (e) {
    console.warn('Failed to get user via client SDK', e);
    return null;
  }
}

// Paddle removed — Dodo is primary provider. Paddle initialization and SDK
// code were intentionally removed to avoid confusion during testing.

export async function openSingleCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openSingleCheckout] Routing single checkout to Dodo with opts:', opts);
  // Keep guest/pending song behavior for later fulfillment
  if (typeof window !== 'undefined' && opts?.songId) {
    try { safeLocalStorage.setItem('pendingSingleSongId', opts.songId); } catch (e) { console.warn('Failed to write pendingSingleSongId', e); }
  }

  // Simple: always use Dodo as the single-item checkout provider
  await openDodoCheckout(opts);
}

export async function openTierCheckout(tierId: string, priceId?: string) {
  console.log('[openTierCheckout] Routing tier checkout to Dodo (via server) for tier:', tierId);
  // For now route to the primary checkout which is Dodo. Keep the existing
  // intendedPurchase flow for anonymous users.
  const user = await resolveUser();
  if (!user) {
    const payload: IntendedPurchase = { type: 'tier', tierId, priceId: priceId || null, ts: Date.now() };
    safeLocalStorage.setItem('intendedPurchase', JSON.stringify(payload));
    if (typeof window !== 'undefined') window.location.href = '/pricing';
    return;
  }

  // Primary provider is Dodo — use the same server-side checkout flow.
  await openPrimaryCheckout();
}

// Fallback Dodo checkout integration (simple hosted checkout URL)
export async function openDodoCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openDodoCheckout] Starting with opts:', opts);
  // Use client-hosted Dodo checkout by default (simpler, no server session required).
  return openDodoClientCheckout(opts);
}

// Primary checkout wrapper — currently routes to Dodo by default so we don't
// need to modify existing Paddle code. Swap implementation here to change
// primary provider later without touching call sites.
export async function openPrimaryCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openPrimaryCheckout] Routing to primary checkout (Dodo overlay) with opts:', opts);
  // Use the in-app Dodo overlay as the primary checkout UI so users stay
  // inside the app and can use express payment buttons (Google/Apple Pay)
  // where available. We include any `songId` in metadata so webhooks can
  // correlate if callers pass it.
  try {
    // Prefer opening the overlay with the single-item price. If callers
    // wanted a different amount they can call overlay/express directly.
    const amount = SINGLE_AMOUNT || (process.env.NEXT_PUBLIC_SINGLE_AMOUNT ? Number(process.env.NEXT_PUBLIC_SINGLE_AMOUNT) : undefined) || 999;
    return await openDodoOverlayCheckout({ amount, currency: 'USD', customer: {}, metadata: { songId: opts?.songId ?? null } });
  } catch (e) {
    console.warn('[openPrimaryCheckout] overlay failed, falling back to hosted checkout', e);
    return openDodoCheckout(opts);
  }
}

// Client-side hosted checkout: builds hosted Dodo checkout URL and redirects the browser.
// This allows a purely frontend checkout flow (no server session creation required).
export async function openDodoClientCheckout(opts?: SingleCheckoutOpts) {
  if (typeof window === 'undefined') {
    throw new Error('openDodoClientCheckout can only be used in the browser');
  }

  const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;
  if (!productId) {
    alert('Checkout is not configured: missing NEXT_PUBLIC_DODO_PRODUCT_ID');
    throw new Error('Missing NEXT_PUBLIC_DODO_PRODUCT_ID');
  }

  const environment = (process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test').toLowerCase();
  const baseUrl = environment === 'production' ? 'https://checkout.dodopayments.com' : 'https://test.checkout.dodopayments.com';

  const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success${opts?.songId ? `?songId=${opts.songId}` : ''}` : '/checkout/success';

  const params = new URL(`${baseUrl}/buy/${productId}`);
  params.searchParams.set('quantity', '1');
  // Use NEXT_PUBLIC prefixed env var for client-side redirect configuration
  params.searchParams.set('redirect_url', process.env.NEXT_PUBLIC_DODO_PAYMENTS_RETURN_URL || process.env.DODO_PAYMENTS_RETURN_URL || successUrl);

  // Attach custom data for server-side webhook processing
  try {
    const customData: any = {
      ...(opts?.songId ? { songId: opts.songId } : {}),
    };
    if (Object.keys(customData).length > 0) {
      params.searchParams.set('custom_data', encodeURIComponent(JSON.stringify(customData)));
    }
  } catch (e) {
    console.debug('Failed to set custom_data for Dodo client checkout', e);
  }

  // If we have a fallback public checkout URL env var, use it to preserve any additional query params
  const fallback = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL;
  if (fallback) {
    // merge params onto fallback URL
    const fb = new URL(fallback);
    params.searchParams.forEach((v, k) => fb.searchParams.set(k, v));
    window.location.href = fb.toString();
    return;
  }

  // Redirect to Dodo hosted checkout
  window.location.href = params.toString();
}

// Open Dodo overlay/modal checkout using the official client SDK.
// This expects a public key to be available as `NEXT_PUBLIC_DODO_PUBLIC_KEY`.
export async function openDodoOverlayCheckout(options: {
  amount: number;
  currency?: string;
  customer?: { email?: string; name?: string };
  metadata?: Record<string, any>;
}) {
  if (typeof window === 'undefined') throw new Error('openDodoOverlayCheckout only runs in browser');
  const { amount, currency = 'USD', customer, metadata } = options;
  const publicKey = process.env.NEXT_PUBLIC_DODO_PUBLIC_KEY || (window as any).__DODO_PUBLIC_KEY;
  if (!publicKey) {
    console.error('Missing Dodo public key for overlay checkout');
    throw new Error('Missing Dodo public key (NEXT_PUBLIC_DODO_PUBLIC_KEY)');
  }

  try {
    // Prefer the packaged SDK installed via npm. Fall back to a global `window.DodoPayments` for compatibility.
    const DodoPaymentsCtor: any = (DodoPaymentsPkg && (DodoPaymentsPkg as any).DodoPayments) || (DodoPaymentsPkg && (DodoPaymentsPkg as any).default) || DodoPaymentsPkg || (window as any).DodoPayments;

    if (!DodoPaymentsCtor) {
      throw new Error('DodoPayments SDK not available. Install `dodopayments-checkout` or expose `window.DodoPayments`.');
    }

    const dodo = new (DodoPaymentsCtor as any)(publicKey);
    const resp = await dodo.checkout({
      amount,
      currency,
      customer: customer || {},
      mode: 'overlay',
      metadata: metadata || {},
    } as any);

    return resp;
  } catch (e) {
    console.error('openDodoOverlayCheckout failed', e);
    throw e;
  }
}

// Express overlay for Google Pay / Apple Pay buttons — wraps `openDodoOverlayCheckout`.
export async function openDodoExpressCheckout(options: { amount: number; currency?: string; customer?: { email?: string }, metadata?: Record<string, any> }) {
  // For express checkout we simply call the overlay checkout and rely on Dodo
  // to surface payment method buttons (Google Pay / Apple Pay) where available.
  return openDodoOverlayCheckout({ amount: options.amount, currency: options.currency, customer: options.customer, metadata: options.metadata });
}