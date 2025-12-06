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
  // track which payment method is loading so only that button shows "Processing..."
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
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
        const res = await fetch('/api/transactions/verify', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
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
      console.debug('[createPendingPurchase] creating pending purchase', { guestEmail, songId });
      const res = await fetch('/api/purchases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestEmail: guestEmail || null, songId })
      });
      let body: any = null;
      try { body = await res.json(); } catch (err) { body = null; }
      if (!res.ok) {
        console.error('[createPendingPurchase] server error', res.status, body);
        return null;
      }
      return body?.purchaseId || null;
    } catch (e) {
      console.error('createPendingPurchase error', e);
      return null;
    }
  };

  const handleExpressCheckout = async (method: 'apple_pay' | 'google_pay' | 'paypal') => {
    setLoadingMethod(method);
    try {
      // Direct flow: call server to build a checkout URL and open Dodo overlay.
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // skipping server-side pending purchase, pass guestEmail/songId only
          songId,
          guestEmail: email || null,
          amount: SINGLE_AMOUNT,
          method // apple_pay, google_pay, or paypal
        })
      });

      if (!res.ok) throw new Error('failed to create checkout session');

      const body = await res.json();
      const checkoutUrl = body?.checkoutUrl;
      const sessionId = body?.sessionId;

      if (!checkoutUrl) throw new Error('no checkout url returned');

      // Open overlay and handle success/failure
      await openDodoOverlayByUrl(checkoutUrl, {
        sessionId,
        onSuccess: async () => {
          console.log('[Express] Payment successful, polling verification...');
          // if webhook uses purchaseId, it won't be present for this direct flow
          // pollVerify will rely on other server-side signals (songId/sessionId)
          const verified = await pollVerify({});
          setLoadingMethod(null);
          if (verified) {
            router.push(`/checkout/success?sessionId=${sessionId}`);
          } else {
            router.push(`/checkout/success?sessionId=${sessionId}&pending=true`);
          }
        },
        onCancel: () => {
          console.log('[Express] Payment cancelled by user');
          setLoadingMethod(null);
        },
        onError: (error: any) => {
          console.error('[Express] Payment error:', error);
          alert('Payment failed. Please try again.');
          setLoadingMethod(null);
        }
      });

    } catch (e) {
      console.error('Express checkout failed', e);
      alert('Express checkout failed. Please try again.');
      setLoadingMethod(null);
    }
  };

  const handleCardCheckout = async () => {
    if (!email || !email.includes('@')) { 
      alert('Please enter a valid email address'); 
      return; 
    }
    
    setLoadingMethod('card');
    try {
      // Direct to Dodo: build checkout URL without creating a pending purchase
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          guestEmail: email,
          amount: SINGLE_AMOUNT,
          method: 'card'
        })
      });

      if (!res.ok) throw new Error('Failed to create checkout session');

      const body = await res.json();
      const checkoutUrl = body?.checkoutUrl;
      const sessionId = body?.sessionId;

      if (!checkoutUrl) throw new Error('No checkout URL returned');

      // Open overlay
      await openDodoOverlayByUrl(checkoutUrl, {
        sessionId,
        onSuccess: async () => {
          console.log('[Card] Payment successful, polling verification...');
          const verified = await pollVerify({});
          setLoadingMethod(null);
          if (verified) {
            router.push(`/checkout/success?sessionId=${sessionId}`);
          } else {
            router.push(`/checkout/success?sessionId=${sessionId}&pending=true`);
          }
        },
        onCancel: () => {
          console.log('[Card] Payment cancelled by user');
          setLoadingMethod(null);
        },
        onError: (error: any) => {
          console.error('[Card] Payment error:', error);
          alert('Payment failed. Please try again.');
          setLoadingMethod(null);
        }
      });

    } catch (e) {
      console.error('Card checkout failed', e);
      alert('Failed to open payment form. Please try again.');
      setLoadingMethod(null);
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
                onClick={() => handleExpressCheckout('apple_pay')}
                disabled={loadingMethod === 'apple_pay'}
                className="w-full bg-black text-white rounded-lg py-4 px-6 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {loadingMethod === 'apple_pay' ? 'Processing...' : 'Pay with Apple Pay'}
              </button>

              <button
                onClick={() => handleExpressCheckout('google_pay')}
                disabled={loadingMethod === 'google_pay'}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 rounded-lg py-4 px-6 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
                {loadingMethod === 'google_pay' ? 'Processing...' : 'Pay with Google Pay'}
              </button>

              <button
                onClick={() => handleExpressCheckout('paypal')}
                disabled={loadingMethod === 'paypal'}
                className="w-full bg-[#0070BA] text-white rounded-lg py-4 px-6 font-medium hover:bg-[#005A94] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.32 21.97a.546.546 0 01-.26-.32c-.03-.15-.01-.3.06-.44l2.68-9.38a.81.81 0 01.77-.56h4.93c2.45 0 4.55-1.64 4.96-3.87.04-.2.06-.4.06-.61 0-2.6-2.11-4.71-4.71-4.71h-7.5c-.5 0-.92.36-1 .85L5.79 16.39c-.09.5.24.98.75 1.07l8.14 1.16a.999.999 0 01-.14 1.99l-6.07-.87a.36.36 0 01-.15.23z"/>
                </svg>
                {loadingMethod === 'paypal' ? 'Processing...' : 'Pay with PayPal'}
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
              disabled={loadingMethod === 'card'}
              className="w-full bg-white border-2 border-purple-600 text-purple-600 rounded-lg py-4 px-6 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                  {/* Visa */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                    <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                      <path d="M18.5 11l-3.2 10h2.2l3.2-10h-2.2zm8.9 6.5l1.2-3.3.7 3.3h-1.9zm2.5 3.5h2l-1.7-10h-1.9c-.4 0-.8.3-.9.6l-3.3 9.4h2.3l.5-1.3h2.8l.2 1.3zm-6.3-3.3c0-2.6-3.6-2.8-3.6-4 0-.4.4-.8 1.2-.9.4 0 1.5-.1 2.7.5l.5-2.2c-.7-.2-1.5-.4-2.6-.4-2.4 0-4.1 1.3-4.1 3.1 0 1.3 1.2 2.1 2.1 2.5.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-1.2 0-1.8-.2-2.8-.6l-.5 2.3c.6.3 1.8.5 3 .5 2.6.1 4.3-1.2 4.3-3.1v.3zm-9.5-6.7l-3.8 10h-2.4l-1.9-7.2c-.1-.4-.2-.5-.6-.7-.6-.3-1.6-.6-2.5-.8l.1-.3h4.2c.5 0 1 .4 1.1.9l1 5.4 2.5-6.3h2.3z" fill="#1434CB"/>
                    </svg>
                  </div>
                  
                  {/* Mastercard */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                    <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                      <circle cx="18" cy="16" r="7" fill="#EB001B"/>
                      <circle cx="30" cy="16" r="7" fill="#F79E1B"/>
                      <path d="M24 10.5a7 7 0 000 11 7 7 0 000-11z" fill="#FF5F00"/>
                    </svg>
                  </div>
                  
                  {/* American Express */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-300 shadow-sm">
                    <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                      <rect x="8" y="8" width="32" height="16" rx="2" fill="#006FCF"/>
                      <path d="M12 13.5h2.5l-.6-1.5h-1.3l-.6 1.5zm4.8 2.5l-1-2.5h-1.3l-1 2.5H12l2-5h1.8l2 5h-1.5z" fill="white"/>
                      <path d="M20 11v5h3v-1h-2v-1h2v-1h-2v-1h2v-1h-3z" fill="white"/>
                      <path d="M25 16l1.8-2.5L25 11h1.5l1 1.5 1-1.5H30l-1.8 2.5L30 16h-1.5l-1-1.5-1 1.5H25z" fill="white"/>
                    </svg>
                  </div>
                  
                  {/* PayPal */}
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm">
                    <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                      <path d="M19.5 9h5.8c2.4 0 4 1.4 4 3.5 0 2.4-1.8 4.5-4.5 4.5h-2.5l-.8 3h-2l2-11zm3.3 6h1.5c1.3 0 2.3-.9 2.3-2.2 0-1-.6-1.8-1.8-1.8h-1.5l-.5 4z" fill="#003087"/>
                      <path d="M27 9h5.8c2.4 0 4 1.4 4 3.5 0 2.4-1.8 4.5-4.5 4.5H30l-.8 3h-2l2-11zm3.3 6h1.5c1.3 0 2.3-.9 2.3-2.2 0-1-.6-1.8-1.8-1.8h-1.5l-.5 4z" fill="#0070E0"/>
                      <path d="M16 13l-.8 4h-2.5l.8-4c.1-.6-.2-1-.8-1h-1.5l-1 5H8l2-11h2.2l-.5 2.5h1.8c1.6 0 2.7 1 2.5 2.5z" fill="#003087"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  Powered by <span className="font-bold text-gray-900">Dodo Payments</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">We'll email your receipt and license key</p>
              </div>

              <button 
                onClick={handleCardCheckout} 
                disabled={loading || !email} 
                className="w-full bg-purple-600 text-white rounded-lg py-4 px-6 font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>

              <button 
                onClick={() => setShowCardForm(false)} 
                disabled={loading}
                className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                ← Back to express checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

