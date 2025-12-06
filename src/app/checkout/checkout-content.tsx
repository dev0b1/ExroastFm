"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaSpinner, FaBolt } from 'react-icons/fa';
import { openDodoOverlayByUrl } from '@/lib/checkout';
import { SINGLE_AMOUNT, SINGLE_LABEL } from '@/lib/pricing';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
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

  async function pollVerify(retries = 12, interval = 1000) {
    const payload: any = {};
    if (songId) payload.songId = songId;
    
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

  

  

  const handleDirectCheckout = async () => {
    setLoadingMethod('dodo');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          guestEmail: email || null,
          amount: SINGLE_AMOUNT,
        })
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error || 'Failed to create checkout session');
      }

      const body = await res.json();
      const checkoutUrl = body?.checkoutUrl;
      const sessionId = body?.sessionId;

      if (!checkoutUrl) throw new Error('No checkout URL returned');

      await openDodoOverlayByUrl(checkoutUrl, {
        sessionId,
        onSuccess: async () => {
          console.log('[Direct] Payment successful, polling verification...');
          const verified = await pollVerify();
          setLoadingMethod(null);
          if (verified) {
            router.push(`/checkout/success?songId=${encodeURIComponent(songId || '')}&sessionId=${sessionId}`);
          } else {
            router.push(`/checkout/success?songId=${encodeURIComponent(songId || '')}&sessionId=${sessionId}&pending=true`);
          }
        },
        onCancel: () => {
          console.log('[Direct] Payment cancelled by user');
          setLoadingMethod(null);
        },
        onError: (error: any) => {
          console.error('[Direct] Payment error:', error);
          alert('Payment failed. Please try again.');
          setLoadingMethod(null);
        }
      });

    } catch (e: any) {
      console.error('Direct checkout failed', e);
      alert(e.message || 'Direct checkout failed. Please try again.');
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

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleDirectCheckout()}
            disabled={loadingMethod !== null}
            className="w-full bg-black text-white rounded-lg py-4 px-6 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMethod === 'dodo' ? 'Opening checkout...' : `Buy ${SINGLE_LABEL}`}
          </button>
        </div>

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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                  <path d="M18.5 11l-3.2 10h2.2l3.2-10h-2.2zm8.9 6.5l1.2-3.3.7 3.3h-1.9zm2.5 3.5h2l-1.7-10h-1.9c-.4 0-.8.3-.9.6l-3.3 9.4h2.3l.5-1.3h2.8l.2 1.3zm-6.3-3.3c0-2.6-3.6-2.8-3.6-4 0-.4.4-.8 1.2-.9.4 0 1.5-.1 2.7.5l.5-2.2c-.7-.2-1.5-.4-2.6-.4-2.4 0-4.1 1.3-4.1 3.1 0 1.3 1.2 2.1 2.1 2.5.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-1.2 0-1.8-.2-2.8-.6l-.5 2.3c.6.3 1.8.5 3 .5 2.6.1 4.3-1.2 4.3-3.1v.3zm-9.5-6.7l-3.8 10h-2.4l-1.9-7.2c-.1-.4-.2-.5-.6-.7-.6-.3-1.6-.6-2.5-.8l.1-.3h4.2c.5 0 1 .4 1.1.9l1 5.4 2.5-6.3h2.3z" fill="#1434CB"/>
                </svg>
              </div>
              
              {/* Mastercard */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                  <circle cx="18" cy="16" r="7" fill="#EB001B"/>
                  <circle cx="30" cy="16" r="7" fill="#F79E1B"/>
                  <path d="M24 10.5a7 7 0 000 11 7 7 0 000-11z" fill="#FF5F00"/>
                </svg>
              </div>
              
              {/* American Express */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                  <rect x="8" y="8" width="32" height="16" rx="2" fill="#006FCF"/>
                  <path d="M12 13.5h2.5l-.6-1.5h-1.3l-.6 1.5zm4.8 2.5l-1-2.5h-1.3l-1 2.5H12l2-5h1.8l2 5h-1.5z" fill="white"/>
                  <path d="M20 11v5h3v-1h-2v-1h2v-1h-2v-1h2v-1h-3z" fill="white"/>
                  <path d="M25 16l1.8-2.5L25 11h1.5l1 1.5 1-1.5H30l-1.8 2.5L30 16h-1.5l-1-1.5-1 1.5H25z" fill="white"/>
                </svg>
              </div>
              
              {/* PayPal */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-3 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
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
      </div>
    </div>
  );
}