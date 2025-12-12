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
      const redirectSongId = body?.redirectSongId || null;

      if (!checkoutUrl) throw new Error('No checkout URL returned');

      await openDodoOverlayByUrl(checkoutUrl, {
        sessionId,
          onSuccess: async () => {
          console.log('[Direct] Payment successful, polling verification...');
          const verified = await pollVerify();
          setLoadingMethod(null);
          const finalSongId = redirectSongId || songId || '';
          if (verified) {
            router.push(`/checkout/success?songId=${encodeURIComponent(finalSongId)}&sessionId=${sessionId}`);
          } else {
            router.push(`/checkout/success?songId=${encodeURIComponent(finalSongId)}&sessionId=${sessionId}&pending=true`);
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

        <div className="mt-8">
          <p className="text-sm text-gray-500 text-center">Powered by Dodo Payments</p>
        </div>
      </div>
    </div>
  );
}