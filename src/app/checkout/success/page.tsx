"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const songId = searchParams.get('songId') || undefined;

  const [verified, setVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!songId) return;
    let cancelled = false;
    const doPoll = async () => {
      setChecking(true);
      for (let i = 0; i < 12; i++) {
        if (cancelled) return;
        try {
          const res = await fetch('/api/transactions/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId })
          });
          if (res.ok) {
            const body = await res.json();
            if (body?.verified) {
              setVerified(true);
              setChecking(false);
              return;
            }
          }
        } catch (e) {
          console.debug('verify poll failed', e);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      if (!cancelled) {
        setVerified(false);
        setChecking(false);
      }
    };
    doPoll();
    return () => { cancelled = true; };
  }, [songId]);

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful! 🎉</h1>

      {!songId ? (
        <>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
          {paymentId && <p className="text-sm text-gray-500">Payment ID: {paymentId}</p>}
          <a href="/" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Return Home</a>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-6">Thanks — we're finalizing your premium song. This page will update when the song is unlocked.</p>

          {checking && <p className="text-sm text-gray-500 mb-4">Checking purchase status…</p>}

          {verified === true && (
            <>
              <p className="text-green-700 font-semibold mb-4">Your premium song is ready!</p>
              <a href={`/song/${encodeURIComponent(songId!)}`} className="inline-block mt-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Open Song</a>
            </>
          )}

          {verified === false && (
            <>
              <p className="text-yellow-700 font-semibold mb-4">Your purchase is pending. If the song doesn't appear, check back in a moment or contact support.</p>
              <a href="/" className="inline-block mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Return Home</a>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
