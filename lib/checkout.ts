"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import initializePaddle from './paddle';

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

// Initialize Paddle once and cache the instance
let paddleInstance: any = null;
let paddleInitPromise: Promise<any> | null = null;

async function ensurePaddleInitialized() {
  // Return cached instance if available
  if (paddleInstance) {
    return paddleInstance;
  }

  // If initialization is already in progress, wait for it
  if (paddleInitPromise) {
    return paddleInitPromise;
  }

  // Start new initialization
  paddleInitPromise = (async () => {
    try {
      // If the Paddle global script was preloaded and exposes `Paddle`, use it directly
      if (typeof window !== 'undefined' && (window as any).Paddle) {
        try {
          paddleInstance = (window as any).Paddle;
          (window as any).__paddleReady = true;
          console.log('[Paddle] Using preloaded window.Paddle instance');
          return paddleInstance;
        } catch (err) {
          console.debug('[Paddle] Error using preloaded Paddle:', err);
        }
      }
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

      if (!clientToken) {
        throw new Error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not configured');
      }

      console.log('[Paddle] Initializing with environment:', environment);

      const instance = await initializePaddle({
        environment: environment === 'production' ? 'production' : 'sandbox',
        token: clientToken,
        eventCallback: (ev) => {
          console.log('[Paddle Event]', ev?.name);
          if (ev?.name === 'checkout.closed' || ev?.name === 'checkout.completed') {
            safeLocalStorage.removeItem('inCheckout');
          }
        }
      });

      paddleInstance = instance;
      return instance;
    } catch (e) {
      console.error('[Paddle] Initialization failed:', e);
      paddleInitPromise = null; // Reset so retry is possible
      throw e;
    }
  })();

  return paddleInitPromise;
}

export async function openSingleCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openSingleCheckout] Starting with opts:', opts);
  
  const user = await resolveUser();
  console.log('[openSingleCheckout] User resolved:', user ? `${user.email} (${user.id})` : 'null');

  if (!user) {
    // Allow anonymous users to open the single-song checkout (guest flow).
    // We persist a pendingSingleSongId so the client can poll for fulfillment
    // and store the full audio locally after webhook unlocks the song.
    console.log('[openSingleCheckout] No authenticated user — opening guest checkout');
    if (typeof window !== 'undefined' && opts?.songId) {
      try { safeLocalStorage.setItem('pendingSingleSongId', opts.songId); } catch (e) { console.warn('Failed to write pendingSingleSongId', e); }
    }
    // continue without returning — we'll open Paddle below without a user
  }

  // Initialize Paddle
  let paddle: any;
  try {
    paddle = await ensurePaddleInitialized();
  } catch (e) {
    console.error('[openSingleCheckout] Failed to initialize Paddle:', e);
    // Fallback to Dodo hosted checkout if configured
    const dodoUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL;
    if (dodoUrl) {
      console.log('[openSingleCheckout] Falling back to Dodo checkout');
      try {
        await openDodoCheckout(opts);
        return;
      } catch (err) {
        console.error('[openSingleCheckout] Dodo fallback failed', err);
      }
    }
    alert('Payment system failed to load. Please refresh and try again.');
    return;
  }

  const singlePriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_SINGLE;
  console.log('[openSingleCheckout] singlePriceId:', singlePriceId);

  if (!singlePriceId) {
    console.error('Single price ID not configured');
    alert('Payment system not configured. Please contact support.');
    return;
  }

  const payload: any = {
    items: [{ priceId: singlePriceId, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/success?type=single${opts?.songId ? `&songId=${opts.songId}` : ''}`,
      theme: 'light',
      allowLogout: false
    },
    customData: {
      // If user exists, include userId so webhook can attach credits/subscription.
      ...(user ? { userId: user.id } : {}),
      ...(opts?.songId && { songId: opts.songId })
    },
    // Include customer email when available to help Paddle identify buyer; guest checkouts omit this.
    ...(user ? { customer: { email: user.email } } : {})
  };

  // If no authenticated user, try to prefill email from localStorage or quick prompt
  try {
    if (!user && typeof window !== 'undefined') {
      // Prefer the nicer modal-based flow if available
      let guestEmail: string | null = null;
      if (typeof window.__requestGuestEmail === 'function') {
        try {
          // Ask the modal to collect email (returns Promise<string|null>)
          guestEmail = await window.__requestGuestEmail();
        } catch (e) {
          console.debug('[openSingleCheckout] guest modal failed', e);
        }
      }

      // Fallback: localStorage
      if (!guestEmail) {
        try { guestEmail = localStorage.getItem('guestEmail'); } catch (e) { guestEmail = null; }
      }

      if (guestEmail) {
        payload.customer = { email: guestEmail };
      }
    }
  } catch (e) {
    console.debug('[openSingleCheckout] guest email collection/storage failed', e);
  }

  console.log('[openSingleCheckout] Opening checkout with payload:', {
    successUrl: payload.settings.successUrl,
    customData: payload.customData
  });

  // Mark checkout as in progress
  safeLocalStorage.setItem('inCheckout', 'true');

  try {
    paddle.Checkout.open(payload);
    console.log('[openSingleCheckout] Checkout opened successfully');
  } catch (error) {
    console.error('[openSingleCheckout] Error opening checkout:', error);
    safeLocalStorage.removeItem('inCheckout');
    alert('Failed to open payment system. Please try again.');
  }
}

export async function openTierCheckout(tierId: string, priceId?: string) {
  console.log('[openTierCheckout] Starting with tierId:', tierId, 'priceId:', priceId);
  
  const user = await resolveUser();
  console.log('[openTierCheckout] User resolved:', user ? `${user.email} (${user.id})` : 'null');

  if (!user) {
    console.log('[openTierCheckout] User is null, redirecting to /pricing');
    if (typeof window !== 'undefined') {
      const payload: IntendedPurchase = {
        type: 'tier',
        tierId,
        priceId: priceId || null,
        ts: Date.now()
      };
      safeLocalStorage.setItem('intendedPurchase', JSON.stringify(payload));
      window.location.href = '/pricing';
    }
    return;
  }

  // Initialize Paddle
  let paddle: any;
  try {
    paddle = await ensurePaddleInitialized();
  } catch (e) {
    console.error('[openTierCheckout] Failed to initialize Paddle:', e);
    alert('Payment system failed to load. Please refresh and try again.');
    return;
  }

  const priceToUse = priceId || process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM;
  console.log('[openTierCheckout] priceToUse:', priceToUse);

  if (!priceToUse) {
    console.error('Tier priceId not configured');
    alert('Payment system not configured. Please contact support.');
    return;
  }

  const payload: any = {
    items: [{ priceId: priceToUse, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/success?tier=${tierId}`,
      theme: 'light',
      allowLogout: false
    },
    customData: {
      userId: user.id
    },
    customer: {
      email: user.email
    }
  };

  console.log('[openTierCheckout] Opening checkout with payload:', {
    successUrl: payload.settings.successUrl,
    customData: payload.customData
  });

  // Mark checkout as in progress
  safeLocalStorage.setItem('inCheckout', 'true');

  try {
    paddle.Checkout.open(payload);
    console.log('[openTierCheckout] Checkout opened successfully');
  } catch (error) {
    console.error('[openTierCheckout] Error opening checkout:', error);
    safeLocalStorage.removeItem('inCheckout');
    alert('Failed to open payment system. Please try again.');
  }
}

// Fallback Dodo checkout integration (simple hosted checkout URL)
export async function openDodoCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openDodoCheckout] Starting with opts:', opts);

  // Resolve user for email prefills
  const user = await resolveUser();

  // Try creating a server-side checkout session via our `/checkout` route.
  // This follows the Dodo Payments template which returns a `checkout_url`.
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
      throw new Error('Server checkout creation failed');
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
    console.warn('[openDodoCheckout] Server checkout creation failed, falling back to hosted URL method', e);
  }

  // Fallback: if server route not configured, fall back to the older hosted URL env var
  const base = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL;
  if (!base) {
    console.error('Dodo checkout URL not configured');
    alert('Alternate payment provider not configured. Please contact support.');
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