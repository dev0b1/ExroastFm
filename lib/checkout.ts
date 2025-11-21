"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function openSingleCheckout(opts?: { songId?: string | null }) {
  const supabase = createClientComponentClient();

  // If user not signed in, try to detect session first. There are cases where
  // getUser() can return null briefly in client-rendered contexts; fall back
  // to getSession() to avoid mis-detecting logged-in users and redirecting
  // them to OAuth unexpectedly.
  const { data: { user } } = await supabase.auth.getUser();
  let resolvedUser = user;
  if (!resolvedUser) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        resolvedUser = sessionData.session.user;
      }
    } catch (e) {
      // ignore and proceed to OAuth flow below
    }
  }

  if (!resolvedUser) {
    // If user not signed in, don't automatically start OAuth anymore.
    // Instead, redirect them to the pricing page so they can choose a plan
    // or sign in explicitly. This avoids unexpected OAuth popups when the
    // user's session is actually present but briefly uninitialized.
    if (typeof window !== 'undefined') {
      try {
        // Persist intended purchase so the flow can be resumed if desired.
        const payload = { type: 'single', songId: opts?.songId || null, ts: Date.now() };
        localStorage.setItem('intendedPurchase', JSON.stringify(payload));
      } catch (e) {}
      window.location.href = '/pricing';
    }
    return;
  }
  // Use resolvedUser for checkout payload
  const userToUse = resolvedUser;

  if (typeof window === 'undefined') return;
  if (!(window as any).Paddle) {
    alert("Payment system is still loading. Please wait a moment and try again.");
    return;
  }

  const singlePriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_SINGLE;
  const priceToUse = singlePriceId || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_PADDLE_PRICE_SINGLE;

  if (!priceToUse) {
    console.error('Single price id not configured');
    alert('Payment system not configured. Please contact support.');
    return;
  }

  const payload: any = {
    items: [{ priceId: priceToUse, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/success?type=single${opts?.songId ? `&songId=${opts.songId}` : ''}`,
      theme: 'light'
    }
  };

  payload.customData = {
    userId: userToUse?.id || null,
    ...(opts?.songId ? { songId: opts.songId } : {})
  };

  // Mark that checkout UI is opening so other client code can avoid
  // interfering (for example, header resume logic). This flag is cleared
  // after a successful checkout (on /success) or when auth resumes.
  try {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('inCheckout', 'true'); } catch (e) {}
    }
  } catch (e) {}

  (window as any).Paddle.Checkout.open(payload);
}

export async function openTierCheckout(tierId: string, priceId?: string) {
  const supabase = createClientComponentClient();
  // Re-check session briefly to avoid stale nulls; prefer getUser then getSession.
  const { data: { user } } = await supabase.auth.getUser();
  let resolvedUser = user;
  if (!resolvedUser) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) resolvedUser = sessionData.session.user;
    } catch (e) {}
  }

  if (!resolvedUser) {
    // Don't auto-trigger OAuth. Send user to pricing so they can explicitly
    // choose to sign in or pick a plan.
    if (typeof window !== 'undefined') {
      try {
        const payload = { type: 'tier', tierId, priceId: priceId || null, ts: Date.now() };
        localStorage.setItem('intendedPurchase', JSON.stringify(payload));
      } catch (e) {}
      window.location.href = '/pricing';
    }
    return;
  }

  if (typeof window === 'undefined') return;
  if (!(window as any).Paddle) {
    alert("Payment system is still loading. Please wait a moment and try again.");
    return;
  }

  const priceToUse = priceId || (process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM as string) || priceId;
  if (!priceToUse) {
    console.error('Tier priceId not configured');
    alert('Payment system not configured. Please contact support.');
    return;
  }

  const payload: any = {
    items: [{ priceId: priceToUse, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/success?tier=${tierId}`,
      theme: 'light'
    }
  };

  payload.customData = { userId: user?.id || null };

  // Mark checkout in localStorage so UI can avoid navigating while Paddle modal is open.
  try {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('inCheckout', 'true'); } catch (e) {}
    }
  } catch (e) {}

  (window as any).Paddle.Checkout.open(payload);
}
