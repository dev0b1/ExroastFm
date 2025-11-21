"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClaimPurchaseInline() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted && user) setSignedIn(true);
      } catch (e) {}
    })();
    return () => { mounted = false };
  }, [supabase]);

  const sendMagicLink = async () => {
    if (!email) return alert('Please enter your email');
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

  if (signedIn) return null;

  return (
    <div className="mt-4 p-4 bg-gray-900/40 rounded-lg">
      <h4 className="text-white font-semibold mb-2">Claim your purchase</h4>
      <p className="text-sm text-gray-400 mb-3">Enter your email to create an account and link this purchase to you.</p>
      {sent ? (
        <div className="text-sm text-green-400">Magic link sent — check your email to complete sign-in.</div>
      ) : (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-3 py-2 rounded-md bg-black border border-white/10 text-white"
          />
          <button
            onClick={sendMagicLink}
            disabled={sending}
            className="btn-primary px-4 py-2"
          >
            {sending ? 'Sending...' : 'Claim'}
          </button>
        </div>
      )}
    </div>
  );
}
