"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { openDodoOverlayCheckout, openDodoExpressCheckout } from '@/lib/checkout';
import DodoExpressCheckout from '@/components/DodoExpressCheckout';
import { SINGLE_AMOUNT, SINGLE_LABEL } from '@/lib/pricing';
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  SINGLE_PRICE_ID,
  PREMIUM_PRICE_ID,
} from '@/lib/pricing';

// Note: pricing is centralized in `lib/pricing`; no local tiers needed here.

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [showCardForm, setShowCardForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Poll the verification endpoint for up to `retries` attempts (interval ms)
  async function pollVerify(opts: { transactionId?: string; songId?: string; purchaseId?: string }, retries = 12, interval = 1000) {
    const payload = {} as any;
    if (opts.transactionId) payload.transactionId = opts.transactionId;
    if (opts.songId) payload.songId = opts.songId;
    if (opts.purchaseId) payload.purchaseId = opts.purchaseId;

    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch('/api/transactions/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) {
          // if 4xx/5xx, retry a few times
          console.debug('[pollVerify] verify endpoint returned', res.status);
        } else {
          const body = await res.json();
          if (body?.verified) return true;
        }
      } catch (err) {
        console.debug('[pollVerify] request failed', err);
      }
      // wait
      await new Promise((r) => setTimeout(r, interval));
    }
    return false;
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const resolvedUser = user || null;
        setUserEmail(resolvedUser?.email || null);
        if (resolvedUser?.email) setEmail(resolvedUser.email);
      } catch (e) {
        console.debug('[checkout-content] failed to resolve user', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [router, searchParams, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-4"
        >
          <FaSpinner className="text-5xl text-exroast-gold animate-spin mx-auto" />
          <h2 className="text-3xl font-bold text-white">Opening checkout...</h2>
          {userEmail ? (
            <div className="text-sm text-gray-400">Signed in as {userEmail}</div>
          ) : (
            <div className="text-sm text-gray-400">Signing in...</div>
          )}
          <p className="text-gray-400">Opening payment form…</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-6 card max-w-md"
        >
          <h2 className="text-3xl font-bold text-red-500">Checkout Error</h2>
          <p className="text-gray-300">{error}</p>
          {userEmail ? (
            <p className="text-sm text-gray-400">Signed in as {userEmail}</p>
          ) : (
            <p className="text-sm text-gray-400">Not signed in</p>
          )}
          <button
            onClick={() => router.push("/pricing")}
            className="btn-primary w-full"
          >
            Back to Pricing
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center space-y-6 card max-w-md p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
        <p className="text-sm text-gray-600">One-time payment • {SINGLE_LABEL}</p>

        {!showCardForm ? (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    // Create a pending purchase on the server so webhook can correlate
                    const createRes = await fetch('/api/purchases/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestEmail: email }) });
                    const createBody = await createRes.json();
                    const purchaseId = createBody?.purchaseId;

                    if (!purchaseId) {
                      alert('Failed to create purchase. Please try again.');
                      setLoading(false);
                      return;
                    }

                    // Pass purchaseId into the Dodo SDK as metadata/custom_data
                    const resp: any = await openDodoExpressCheckout({ amount: SINGLE_AMOUNT, currency: 'USD', customer: { email }, metadata: { purchaseId } });

                    // Poll for webhook verification by purchaseId (webhook will mark the purchase)
                    const verifiedByPurchase = await pollVerify({ purchaseId });

                    if (verifiedByPurchase) {
                      router.push('/checkout/success');
                    } else {
                      router.push('/checkout/success?pending=true');
                    }
                  } catch (e) {
                    console.error('Express checkout failed', e);
                    alert('Express checkout failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-black text-white rounded-lg py-4 px-6 font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Pay with Google/Apple Pay
              </button>

              <button
                onClick={() => setShowCardForm(true)}
                className="w-full bg-white border-2 border-purple-600 text-purple-600 rounded-lg py-4 px-6 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                Pay with card
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-2 pt-2">
                <p className="text-sm font-medium text-gray-700">Powered by <span className="font-bold text-gray-900">Dodo Payments</span></p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">We'll email your receipt and license key</p>
              </div>

              <button
                onClick={async () => {
                  if (!email) { alert('Please enter your email'); return; }
                  setLoading(true);
                  try {
                    // create pending purchase
                    const createRes = await fetch('/api/purchases/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestEmail: email }) });
                    const createBody = await createRes.json();
                    const purchaseId = createBody?.purchaseId;
                    if (!purchaseId) {
                      alert('Failed to create purchase. Please try again.');
                      setLoading(false);
                      return;
                    }

                    const resp: any = await openDodoOverlayCheckout({ amount: SINGLE_AMOUNT, currency: 'USD', customer: { email }, metadata: { purchaseId } });

                    const verifiedByPurchase = await pollVerify({ purchaseId });
                    if (verifiedByPurchase) {
                      router.push('/checkout/success');
                    } else {
                      router.push('/checkout/success?pending=true');
                    }
                  } catch (e) {
                    console.error('Overlay checkout failed', e);
                    alert('Failed to open payment form');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !email}
                className="w-full bg-purple-600 text-white rounded-lg py-4 px-6 font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Pay ${SINGLE_LABEL}`}
              </button>

              <button onClick={() => setShowCardForm(false)} className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors">← Back to express checkout</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
