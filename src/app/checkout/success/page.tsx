"use client";
export const dynamic = 'force-dynamic';
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from 'react';
import { FaTwitter, FaFacebook, FaCopy, FaDownload } from 'react-icons/fa';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const songId = searchParams.get('songId') || undefined;

  const [verified, setVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [bestMatch, setBestMatch] = useState<string | null>(null);
  const [songData, setSongData] = useState<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!songId) return;
    let cancelled = false;

    // First, ask the verify endpoint which, for premade songs, will immediately
    // return premade info (we've opted to trust checkout by manifest). This avoids
    // waiting for a webhook and prevents falling back to demo templates.
    const tryVerifyThenFetch = async () => {
      try {
        setChecking(true);
        const vres = await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId })
        });
        if (vres.ok) {
          const vb = await vres.json();
          // If verify returned premade info, use it
          if (vb?.premade && vb.premade.fullUrl) {
            setSongData({ id: vb.premade.id || songId, fullUrl: vb.premade.fullUrl, previewUrl: vb.premade.fullUrl });
            setVerified(true);
            setChecking(false);
            return;
          }
          // If verify returned a DB transaction or verified flag, try fetching the song row
          if (vb?.verified) {
            try {
              const sres = await fetch(`/api/song/${encodeURIComponent(songId)}`);
              if (sres.ok) {
                const sb = await sres.json();
                if (sb?.success) {
                  setSongData(sb.song);
                  if (sb.song?.fullUrl) setVerified(true);
                }
              }
            } catch (e) {
              console.debug('[checkout success] fetch after verify failed', e);
            }
            setChecking(false);
            return;
          }
        }
      } catch (e) {
        console.debug('[checkout success] verify call failed', e);
      }

      // Fallback: direct fetch the song endpoint (may return premade manifest entry)
      try {
        const res = await fetch(`/api/song/${encodeURIComponent(songId)}`);
        if (res.ok) {
          const body = await res.json();
          if (body?.success && body.song) {
            setSongData(body.song);
            if (body.song?.fullUrl) setVerified(true);
          }
        }
      } catch (e) {
        console.debug('[checkout success] direct song fetch failed', e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    tryVerifyThenFetch();
    return () => { cancelled = true; };
  }, [songId]);

  // If song is not yet available, request a best-match template name from the server
  useEffect(() => {
    if (!songId) return;
    let cancelled = false;
    const doMatch = async () => {
      try {
        const res = await fetch(`/api/song/match?songId=${encodeURIComponent(songId)}`);
        if (!res.ok) return;
        const body = await res.json();
        if (!cancelled && body?.bestMatch) setBestMatch(body.bestMatch);
      } catch (e) {
        console.debug('best-match request failed', e);
      }
    };
    doMatch();
    return () => { cancelled = true; };
  }, [songId]);

  // Poll song endpoint until fullUrl available (if purchase verified)
  useEffect(() => {
    if (!songId) return;
    let cancelled = false;
    let tries = 0;
    const pollSong = async () => {
      while (!cancelled && tries < 30) {
        tries++;
        try {
          const res = await fetch(`/api/song/${encodeURIComponent(songId)}`);
          if (res.ok) {
            const body = await res.json();
            if (body?.success) {
              setSongData(body.song);
              if (body.song?.fullUrl) return;
            }
          }
        } catch (e) {
          // ignore
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    };
    pollSong();
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

          {checking && (
            <div className="flex flex-col items-center mb-4">
              <div className="loader mb-2" />
              <p className="text-sm text-gray-500">Checking purchase status…</p>
            </div>
          )}

          <style>{`\n            .loader{width:36px;height:36px;border-radius:9999px;border:4px solid rgba(255,255,255,0.08);border-top-color:#8b5cf6;animation:spin 1s linear infinite}\n            @keyframes spin{to{transform:rotate(360deg)}}\n          `}</style>

          {verified === true && (
            <>
              <p className="text-green-700 font-semibold mb-4">Your premium song is ready!</p>
              {songData?.fullUrl ? (
                <div className="space-y-4">
                  <video className="w-full rounded-lg shadow-lg" controls src={songData.fullUrl} />

                  <div className="flex items-center justify-center gap-3">
                    <button onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      } catch {}
                    }} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg">
                      <FaCopy /> {copySuccess ? 'Link Copied' : 'Copy Link'}
                    </button>

                    <a className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg" href={songData.fullUrl} download>
                      <FaDownload /> Download MP4
                    </a>

                    <a className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Just got my ExRoast premium song 🎶")}`}>
                      <FaTwitter /> Twitter
                    </a>

                    <a className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}>
                      <FaFacebook /> Facebook
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-3">We have unlocked your song, but it's still being prepared. This can take a moment.</p>
                  <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
            </>
          )}

          {verified === false && (
            <>
              <p className="text-yellow-700 font-semibold mb-4">Your purchase is pending. If the song doesn't appear, check back in a moment or contact support.</p>
              {bestMatch && (
                <p className="text-sm text-gray-400">Best match template: <span className="font-mono text-white">{bestMatch}</span></p>
              )}
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
