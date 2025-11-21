"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheckCircle, FaDownload, FaMusic } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ClaimPurchaseInline from '../../components/ClaimPurchaseInline';
import AuthAwareCTA from "@/components/AuthAwareCTA";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useEffect } from 'react';

export default function SuccessPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    setSending(true);
    try {
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
      await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      setSent(true);
    } catch (e) {
      console.error('Error sending magic link', e);
      alert('Unable to send magic link. Please try again.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // If a pending client token exists (we saved it in checkout), try to
    // claim the purchase automatically. This will link the purchase to an
    // app user account on the server; it's best-effort and if it can't fully
    // create a session the UI will fall back to the magic-link flow already
    // provided below.
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('pendingClientToken');
        if (!token) return;
        // Call claim endpoint
        const res = await fetch('/api/claim-purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientToken: token }) });
        const data = await res.json();
        if (data?.success && data?.claimed) {
          // Clear pending token so we don't retry repeatedly
          try { localStorage.removeItem('pendingClientToken'); } catch (e) {}
          // Optionally you could refresh or navigate; we keep the page and
          // let the user sign in if needed via the ClaimPurchaseInline.
          console.log('Purchase claimed via token', data);
        }
      } catch (e) {
        // ignore — fall back to claim UI
        console.warn('Auto-claim attempt failed', e);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="text-8xl mx-auto">👑</div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Payment Successful! 👑
              </h1>
              <p className="text-xl text-white">
                Thank you for your purchase. Your full song is now unlocked!
              </p>
            </div>

            <div className="card space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <FaMusic className="text-4xl text-exroast-gold" />
                <div className="text-left">
                  <h3 className="font-bold text-lg text-gradient">What's Next?</h3>
                  <p className="text-white">Your song is ready to download and share</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/preview">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download Song</span>
                  </motion.button>
                </Link>
                
                <AuthAwareCTA className="btn-primary w-full flex items-center justify-center space-x-2">
                  <FaMusic />
                  <span>Create Another</span>
                </AuthAwareCTA>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gradient mb-2">
                Receipt & Account Info
              </h3>
              <p className="text-sm text-white">
                A receipt has been sent to your email. You can manage your subscription 
                and downloads from your account dashboard.
              </p>

              {/* If user is not signed in, offer a simple way to claim the purchase */}
              <div className="mt-4">
                <ClaimPurchaseInline />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
