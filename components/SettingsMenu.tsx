"use client";

import { useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation";
import { openSingleCheckout, openTierCheckout } from '@/lib/checkout';

export default function SettingsMenu({ onClose }: { onClose?: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      try { localStorage.removeItem('intendedPurchase'); } catch (e) {}
      router.push('/');
    } catch (e) {
      console.error('Sign out failed', e);
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-exroast-pink/30 rounded-xl shadow-xl z-50">
      <div className="p-3">
        <button
          onClick={() => { router.push('/account'); onClose?.(); }}
          className="w-full text-left px-3 py-2 rounded hover:bg-white/5"
        >
          Account
        </button>
        <button
          onClick={() => { openSingleCheckout(); onClose?.(); }}
          className="w-full text-left px-3 py-2 rounded hover:bg-white/5"
        >
          Upgrade — One-time
        </button>
        <button
          onClick={() => { openTierCheckout('unlimited'); onClose?.(); }}
          className="w-full text-left px-3 py-2 rounded hover:bg-white/5"
        >
          Go Unlimited
        </button>
        <div className="border-t border-white/5 my-2" />
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-red-400"
          disabled={loading}
        >
          {loading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
