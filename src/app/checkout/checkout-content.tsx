"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { openSingleCheckout, openPrimaryCheckout, openDodoClientCheckout } from '@/lib/checkout';
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  SINGLE_PRICE_ID,
  PREMIUM_PRICE_ID,
} from '@/lib/pricing';

const tiers: { [key: string]: { priceId: string; name: string } } = {
  standard: {
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STANDARD || "pri_standard",
    name: "Standard",
  },
  premium: {
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM || "pri_premium",
    name: "Premium",
  },
};

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const processCheckout = async () => {
      try {
        // Verify user is logged in (try getUser then fallback to getSession)
        const { data: { user } } = await supabase.auth.getUser();
        let resolvedUser = user;
        if (!resolvedUser) {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user) resolvedUser = sessionData.session.user;
          } catch (e) {
            // ignore
          }
        }

        if (!resolvedUser) {
          // If the user isn't signed in, send them to the pricing page rather
          // than forcing an automatic OAuth flow. Pricing shows both one-time
          // and subscription options.
          router.push('/pricing');
          return;
        }
        setUserEmail(resolvedUser.email || null);

        // Get tier from query params
        const tier = searchParams.get("tier") || "premium";
        const type = searchParams.get("type");

        const songId = searchParams.get('songId');

        // Prefer client-side hosted Dodo checkout to reduce server complexity.
        // If you prefer server-created sessions, switch to `openSingleCheckout` / `openPrimaryCheckout`.
        try {
          if (type === 'single') {
            // Client-side checkout for single item
            await openDodoClientCheckout({ songId: songId || undefined });
          } else {
            // Client-side checkout for tier/product path
            await openDodoClientCheckout({ songId: songId || undefined });
          }
        } catch (err) {
          // fallback to server flow if client checkout fails
          console.warn('[checkout-content] client checkout failed, falling back to server flow', err);
          if (type === 'single') {
            await openSingleCheckout({ songId: songId || undefined });
          } else {
            await openPrimaryCheckout({ songId: songId || undefined });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Checkout error:", err);
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    };

    processCheckout();
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
          <p className="text-gray-400">Redirecting to Paddle</p>
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
        className="relative z-10 text-center space-y-4"
      >
        <FaSpinner className="text-5xl text-exroast-gold animate-spin mx-auto" />
        <h2 className="text-3xl font-bold text-white">Opening checkout...</h2>
        <p className="text-gray-400">Redirecting to Paddle</p>
      </motion.div>
    </div>
  );
}
