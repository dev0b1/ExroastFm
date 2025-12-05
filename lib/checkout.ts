"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

  // Resolve user for email prefills
  const user = await resolveUser();

  // Try creating a server-side checkout session via our `/checkout` route.
  // This follows the Dodo Payments template which returns a `checkout_url`.
  let serverCheckoutError: any = null;
  try {
    const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID || '';
    // Include productId and optional email in query params so the Checkout
    // helper (which reads search params) receives them reliably.
    const query = new URLSearchParams();
    if (productId) query.set('productId', productId);
    if (user?.email) query.set('customerEmail', user.email);

    const resp = await fetch(`/api/checkout?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: 1,
        metadata: {
          ...(user ? { userId: user.id } : {}),
          ...(opts?.songId && { songId: opts.songId })
        }
      })
    });

    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => 'Unable to read response body');
      console.error('[openDodoCheckout] server checkout creation failed', resp.status, bodyText);
      throw new Error('Server checkout creation failed: ' + bodyText);
    }

    const json = await resp.json();
    const url = json.checkout_url || json.checkoutUrl || json.url;
    if (!url) throw new Error('No checkout url returned');

    safeLocalStorage.setItem('inCheckout', 'true');
    // Navigate the browser to the hosted checkout
    window.location.href = url;
    console.log('[openDodoCheckout] Redirecting to server-created Dodo checkout:', url);
    return;
  } catch (e) {
    serverCheckoutError = e;
    console.warn('[openDodoCheckout] Server checkout creation failed, falling back to hosted URL method', e);
  }

  // Fallback: if server route not configured, fall back to the older hosted URL env var
  const base = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL;
  if (!base) {
    console.error('Dodo checkout URL not configured');
    // Provide a clearer message to help debugging common misconfigurations
    const details = serverCheckoutError ? String(serverCheckoutError).slice(0, 300) : 'no server error available';
    alert(
      'Alternate payment provider not configured. Please set `NEXT_PUBLIC_DODO_CHECKOUT_URL` or ensure the server `POST /api/checkout` route works (env: DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_RETURN_URL).\n\nDetails: ' + details
    );
    return;
  }

  const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success?type=single${opts?.songId ? `&songId=${opts.songId}` : ''}` : '/checkout/success';

  const customData: any = {
    ...(user ? { userId: user.id } : {}),
    ...(opts?.songId && { songId: opts.songId })
  };

  const params = new URL(base);
  params.searchParams.set('success_url', successUrl);
  params.searchParams.set('custom_data', encodeURIComponent(JSON.stringify(customData)));
  if (user && user.email) params.searchParams.set('email', user.email);

  // Mark checkout as in progress
  safeLocalStorage.setItem('inCheckout', 'true');

  try {
    const url = params.toString();
    window.open(url, '_blank');
    console.log('[openDodoCheckout] Opened Dodo checkout (fallback):', url);
  } catch (e) {
    console.error('[openDodoCheckout] Failed to open Dodo checkout', e);
    safeLocalStorage.removeItem('inCheckout');
    alert('Failed to open alternate payment system. Please try again.');
  }
}

// Primary checkout wrapper — currently routes to Dodo by default so we don't
// need to modify existing Paddle code. Swap implementation here to change
// primary provider later without touching call sites.
export async function openPrimaryCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openPrimaryCheckout] Routing to primary checkout (Dodo for now) with opts:', opts);
  // For now, use Dodo as the primary provider. Keep `openSingleCheckout`
  // intact so Paddle logic remains available for future fallback.
  return openDodoCheckout(opts);
}