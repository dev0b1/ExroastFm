"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSpinner, FaCreditCard, FaBolt } from 'react-icons/fa';
import { openDodoOverlayCheckout, openDodoExpressCheckout, openDodoOverlayByUrl } from '@/lib/checkout';
import { SINGLE_AMOUNT, SINGLE_LABEL } from '@/lib/pricing';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [showCardForm, setShowCardForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const songId = searchParams?.get('songId') || undefined;

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setEmail(user.email);
      } catch (e) {
        console.debug('[checkout] failed to get user', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [supabase]);

  async function pollVerify(opts: { purchaseId?: string }, retries = 12, interval = 1000) {
    const payload: any = {};
    if (opts.purchaseId) payload.purchaseId = opts.purchaseId;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch('/api/transactions/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          console.debug('[pollVerify] verify endpoint returned', res.status);
        } else {
          const body = await res.json();
          if (body?.verified) return true;
        }
      } catch (e) {
        console.debug('[pollVerify] failed', e);
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  }

  const createPendingPurchase = async (guestEmail?: string | null) => {
    try {
      const res = await fetch('/api/purchases/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestEmail: guestEmail || null, songId }) });
      if (!res.ok) throw new Error('create purchase failed');
      const body = await res.json();
      return body?.purchaseId;
    } catch (e) {
      console.error('createPendingPurchase error', e);
      return null;
    }
  };

  const handleExpressCheckout = async (method: string) => {
    setLoading(true);
    try {
      const purchaseId = await createPendingPurchase(email || null);
      if (!purchaseId) {
        alert('Failed to create purchase. Please try again.');
        setLoading(false);
        return;
      }
      // Create a server-side checkout URL which includes `purchaseId` so
      // the webhook can correlate and fulfill the purchase. Then open the
      // overlay by URL (SDK or popup fallback).
      const res = await fetch('/api/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, songId, guestEmail: email || null, amount: SINGLE_AMOUNT, method })
      });
      if (!res.ok) throw new Error('failed to create checkout session');
      const body = await res.json();
      const checkoutUrl = body?.checkoutUrl;
      if (!checkoutUrl) throw new Error('no checkout url returned');

      await openDodoOverlayByUrl(checkoutUrl);

      const verified = await pollVerify({ purchaseId });
      if (verified) router.push('/checkout/success');
      else router.push('/checkout/success?pending=true');
    } catch (e) {
      console.error('Express checkout failed', e);
      alert('Express checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardCheckout = async () => {
    if (!email) { alert('Please enter your email'); return; }
    setLoading(true);
    try {
      const purchaseId = await createPendingPurchase(email);
      if (!purchaseId) { alert('Failed to create purchase. Please try again.'); setLoading(false); return; }

      await openDodoOverlayCheckout({ amount: SINGLE_AMOUNT, currency: 'USD', customer: { email }, metadata: { purchaseId, songId } });

      const verified = await pollVerify({ purchaseId });
      if (verified) router.push('/checkout/success');
      else router.push('/checkout/success?pending=true');
    } catch (e) {
      console.error('Card overlay failed', e);
      alert('Failed to open payment form');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-4">
          <FaSpinner className="text-5xl text-exroast-gold animate-spin mx-auto" />
          <h2 className="text-3xl font-bold text-white">Opening checkout...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-6 card max-w-md p-6">
          <h2 className="text-3xl font-bold text-red-500">Checkout Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <FaBolt className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h2>
          <p className="text-gray-600">One-time payment • {SINGLE_LABEL}</p>
        </div>

        {!showCardForm ? (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleExpressCheckout('Apple Pay')}
                disabled={loading}
                className="w-full bg-black text-white rounded-lg py-4 px-6 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Pay with Apple Pay
              </button>

              <button
                onClick={() => handleExpressCheckout('Google Pay')}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-lg py-4 px-6 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                Pay with Google Pay
              </button>

              <button
                onClick={() => handleExpressCheckout('PayPal')}
                disabled={loading}
                className="w-full bg-[#0070BA] text-white rounded-lg py-4 px-6 font-medium hover:bg-[#005A94] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8.32 21.97a.546.546 0 01-.26-.32c-.03-.15-.01-.3.06-.44l2.68-9.38a.81.81 0 01.77-.56h4.93c2.45 0 4.55-1.64 4.96-3.87.04-.2.06-.4.06-.61 0-2.6-2.11-4.71-4.71-4.71h-7.5c-.5 0-.92.36-1 .85L5.79 16.39c-.09.5.24.98.75 1.07l8.14 1.16a.999.999 0 01-.14 1.99l-6.07-.87a.36.36 0 01-.15.23z"/></svg>
                Pay with PayPal
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or pay with card</span>
              </div>
            </div>

            <button
              onClick={() => setShowCardForm(true)}
              className="w-full bg-white border-2 border-purple-600 text-purple-600 rounded-lg py-4 px-6 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaCreditCard className="w-5 h-5" />
              Continue with Card
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Secure Checkout</p>
                  <p className="text-xs text-gray-600">256-bit SSL encryption • PCI DSS compliant</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <p className="text-xs font-semibold text-gray-500 text-center mb-4 tracking-wide">WE ACCEPT</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {/* Payment logos (omitted svg details for brevity) */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">Visa</div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-200 shadow-sm">Mastercard</div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-300 shadow-sm">Amex</div>
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">PayPal</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Powered by <span className="font-bold text-gray-900">Dodo Payments</span></p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                <p className="text-xs text-gray-500 mt-2">We'll email your receipt and license key</p>
              </div>

              <button onClick={handleCardCheckout} disabled={loading || !email} className="w-full bg-purple-600 text-white rounded-lg py-4 px-6 font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>

              <button onClick={() => setShowCardForm(false)} className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors">← Back to express checkout</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

