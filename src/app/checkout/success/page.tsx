"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from 'react';
import { FaTwitter, FaFacebook, FaCopy, FaDownload, FaShare, FaTiktok, FaWhatsapp } from 'react-icons/fa';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!songId) return;
    let cancelled = false;

    // First, assign a premium song from the database based on the user's story/style
    const assignPremiumSong = async () => {
      try {
        setChecking(true);
        
        // Fetch the song to get story and style for matching
        const songRes = await fetch(`/api/song/${encodeURIComponent(songId)}`);
        if (!songRes.ok) {
          setChecking(false);
          return;
        }
        
        const songData = await songRes.json();
        if (!songData?.success || !songData.song) {
          setChecking(false);
          return;
        }
        
        const song = songData.song;
        
        // If song already has a premium mp4, use it
        if (song.isPurchased && song.fullUrl && song.fullUrl.endsWith('.mp4')) {
          setSongData(song);
          setVerified(true);
          setChecking(false);
          return;
        }
        
        // Extract musicStyle from song if available
        const musicStyle = (song as any).musicStyle || (song as any).music_style || song.genre || '';
        
        // Call assign-premium to match and assign a premium song from DB
        const assignRes = await fetch('/api/song/assign-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: song.id,
            story: song.story,
            style: song.style,
            musicStyle: musicStyle
          })
        });
        
        if (assignRes.ok) {
          const assignData = await assignRes.json();
          console.log('[checkout success] assign-premium response', {
            success: assignData?.success,
            fullUrl: assignData?.fullUrl,
            previewUrl: assignData?.previewUrl,
            premiumSongId: assignData?.premiumSongId,
            title: assignData?.title,
            isSupabaseUrl: assignData?.fullUrl?.includes('supabase'),
            isHttpUrl: assignData?.fullUrl?.startsWith('http'),
            endsWithMp4: assignData?.fullUrl?.endsWith('.mp4')
          });
          
          if (assignData?.success && assignData.fullUrl) {
            // Verify it's an mp4 file
            if (!assignData.fullUrl.endsWith('.mp4')) {
              console.warn('[checkout success] assigned URL is not mp4:', assignData.fullUrl);
            }
            
            // Test the URL before setting it
            try {
              const testRes = await fetch(assignData.fullUrl, { method: 'HEAD' });
              console.log('[checkout success] URL test result', {
                url: assignData.fullUrl,
                status: testRes.status,
                contentType: testRes.headers.get('content-type'),
                contentLength: testRes.headers.get('content-length'),
                acceptRanges: testRes.headers.get('accept-ranges')
              });
              
              if (!testRes.ok) {
                console.error('[checkout success] URL test failed', {
                  url: assignData.fullUrl,
                  status: testRes.status,
                  statusText: testRes.statusText
                });
              }
            } catch (testError) {
              console.error('[checkout success] URL test error', {
                url: assignData.fullUrl,
                error: testError
              });
            }
            
            // Fetch updated song with premium URL
            const updatedRes = await fetch(`/api/song/${encodeURIComponent(songId)}`);
            if (updatedRes.ok) {
              const updatedData = await updatedRes.json();
              if (updatedData?.success && updatedData.song) {
                console.log('[checkout success] updated song data', { 
                  fullUrl: updatedData.song.fullUrl, 
                  isMp4: updatedData.song.fullUrl?.endsWith('.mp4'),
                  isSupabase: updatedData.song.fullUrl?.includes('supabase'),
                  isHttp: updatedData.song.fullUrl?.startsWith('http'),
                  previewUrl: updatedData.song.previewUrl
                });
                setSongData(updatedData.song);
                setVerified(true);
                setChecking(false);
                return;
              }
            }
          } else {
            console.error('[checkout success] assign-premium failed', assignData);
          }
        } else {
          const errorData = await assignRes.json().catch(() => ({}));
          console.error('[checkout success] assign-premium request failed', { 
            status: assignRes.status, 
            statusText: assignRes.statusText,
            error: errorData 
          });
        }
        
        // Fallback: if assign-premium failed, try verify endpoint
        const vres = await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId })
        });
        if (vres.ok) {
          const vb = await vres.json();
          if (vb?.premade && vb.premade.fullUrl) {
            setSongData({ id: vb.premade.id || songId, fullUrl: vb.premade.fullUrl, previewUrl: vb.premade.fullUrl });
            setVerified(true);
            setChecking(false);
            return;
          }
          if (vb?.verified) {
            const sres = await fetch(`/api/song/${encodeURIComponent(songId)}`);
            if (sres.ok) {
              const sb = await sres.json();
              if (sb?.success) {
                setSongData(sb.song);
                if (sb.song?.fullUrl) setVerified(true);
              }
            }
          }
        }
      } catch (e) {
        console.debug('[checkout success] assign premium failed', e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    assignPremiumSong();
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
          <p className="text-gray-600 mb-6">🔥 Your roast song is being prepared! Get ready to serve your ex the ultimate burn. This page will update when your savage roast is ready to unleash! 💀</p>

          {checking && (
            <div className="flex flex-col items-center mb-4">
              <div className="loader mb-2" />
              <p className="text-sm text-gray-500">Checking purchase status…</p>
            </div>
          )}

          <style>{`\n            .loader{width:36px;height:36px;border-radius:9999px;border:4px solid rgba(255,255,255,0.08);border-top-color:#8b5cf6;animation:spin 1s linear infinite}\n            @keyframes spin{to{transform:rotate(360deg)}}\n          `}</style>

          {verified === true && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-pink-600 mb-2">🔥 Your Roast Song is Ready! 🔥</h2>
                <p className="text-gray-700 text-lg">Time to roast your ex! Play it, share it, and let the world know what they're missing. This is your moment to shine! 💀✨</p>
              </div>
              {songData?.fullUrl ? (
                <div className="space-y-4">
                  <div className="max-w-3xl mx-auto bg-gray-900 rounded-xl p-4 shadow-2xl">
                    <video 
                      className="w-full rounded-lg bg-black" 
                      preload="metadata"
                      playsInline
                      crossOrigin="anonymous"
                      style={{ 
                        width: "100%",
                        height: "auto",
                        maxHeight: "75vh",
                        aspectRatio: "16/9",
                        objectFit: "contain"
                      }}
                      controls={false}
                      ref={(video) => {
                        if (video) {
                          setVideoRef(video);
                          // Store video ref for custom controls
                          (window as any).__videoRef = video;
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onVolumeChange={() => {
                        if (videoRef) {
                          setIsMuted(videoRef.muted);
                        }
                      }}
                      onLoadStart={() => {
                        console.log('[video] Load start', { 
                          url: songData.fullUrl,
                          isSupabase: songData.fullUrl?.includes('supabase'),
                          isHttp: songData.fullUrl?.startsWith('http')
                        });
                      }}
                      onLoadedMetadata={() => {
                        console.log('[video] Metadata loaded', { 
                          url: songData.fullUrl,
                          videoWidth: (document.querySelector('video') as HTMLVideoElement)?.videoWidth,
                          videoHeight: (document.querySelector('video') as HTMLVideoElement)?.videoHeight
                        });
                      }}
                      onLoadedData={() => {
                        console.log('[video] Data loaded', { url: songData.fullUrl });
                      }}
                      onCanPlay={() => {
                        console.log('[video] Can play', { url: songData.fullUrl });
                      }}
                      onError={(e) => {
                        const video = e.currentTarget;
                        console.error('[video] Error loading video', {
                          url: songData.fullUrl,
                          error: video.error,
                          errorCode: video.error?.code,
                          errorMessage: video.error?.message,
                          networkState: video.networkState,
                          readyState: video.readyState,
                          src: video.currentSrc || video.src
                        });
                      }}
                      onStalled={() => {
                        console.warn('[video] Stalled', { url: songData.fullUrl });
                      }}
                      onSuspend={() => {
                        console.warn('[video] Suspend', { url: songData.fullUrl });
                      }}
                    >
                      <source src={songData.fullUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Custom Video Controls */}
                    <div className="mt-4 flex items-center justify-center gap-4 bg-gray-800 rounded-lg p-3">
                      <button
                        onClick={() => {
                          if (videoRef) {
                            if (isPlaying) {
                              videoRef.pause();
                            } else {
                              videoRef.play();
                            }
                          }
                        }}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef) {
                            videoRef.currentTime = Math.max(0, videoRef.currentTime - 10);
                          }
                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        ⏪ -10s
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef) {
                            videoRef.currentTime = Math.min(videoRef.duration, videoRef.currentTime + 10);
                          }
                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        +10s ⏩
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef) {
                            videoRef.muted = !videoRef.muted;
                            setIsMuted(videoRef.muted);
                          }
                        }}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button 
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 2000);
                        } catch (err) {
                          console.error('Failed to copy link:', err);
                        }
                      }} 
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaCopy /> {copySuccess ? 'Link Copied!' : 'Copy Link'}
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          console.log('[download] Starting download', { url: songData.fullUrl });
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `exroast-${songId || 'song'}.mp4`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(url);
                          console.log('[download] Download completed');
                        } catch (err) {
                          console.error('[download] Download failed', err);
                          // Fallback: open in new tab
                          window.open(songData.fullUrl, '_blank');
                        }
                      }}
                      className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaDownload /> Download MP4
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          
                          // Use Web Share API if available (supports sharing files)
                          if (navigator.share && navigator.canShare) {
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Premium Song',
                                text: 'Check out my ExRoast premium song! 🔥🎶'
                              });
                              return;
                            }
                          }
                          // Fallback: share the video URL
                          if (navigator.share) {
                            await navigator.share({
                              title: 'My ExRoast Premium Song',
                              text: 'Check out my ExRoast premium song! 🔥🎶',
                              url: songData.fullUrl
                            });
                          } else {
                            // Fallback: copy video URL to clipboard
                            await navigator.clipboard.writeText(songData.fullUrl);
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                            alert('Video URL copied to clipboard! You can paste it anywhere to share.');
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('[share] Share failed', err);
                            // Fallback: copy video URL to clipboard
                            await navigator.clipboard.writeText(songData.fullUrl);
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                            alert('Video URL copied to clipboard!');
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaShare /> Share Video
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          
                          // Use Web Share API for WhatsApp
                          if (navigator.share && navigator.canShare) {
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Premium Song',
                                text: 'Check out my ExRoast premium song! 🔥🎶'
                              });
                              return;
                            }
                          }
                          // Fallback: WhatsApp web share
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out my ExRoast premium song! 🔥🎶 ${songData.fullUrl}`)}`;
                          window.open(whatsappUrl, '_blank');
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('[whatsapp] Share failed', err);
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out my ExRoast premium song! 🔥🎶 ${songData.fullUrl}`)}`;
                            window.open(whatsappUrl, '_blank');
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaWhatsapp /> WhatsApp
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          
                          // Use Web Share API for TikTok
                          if (navigator.share && navigator.canShare) {
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Premium Song',
                                text: 'Check out my ExRoast premium song! 🔥🎶'
                              });
                              return;
                            }
                          }
                          // Fallback: TikTok upload page
                          const tiktokUrl = `https://www.tiktok.com/upload?caption=${encodeURIComponent(`Check out my ExRoast premium song! 🔥🎶 ${songData.fullUrl}`)}`;
                          window.open(tiktokUrl, '_blank');
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('[tiktok] Share failed', err);
                            const tiktokUrl = `https://www.tiktok.com/upload?caption=${encodeURIComponent(`Check out my ExRoast premium song! 🔥🎶 ${songData.fullUrl}`)}`;
                            window.open(tiktokUrl, '_blank');
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaTiktok /> TikTok
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          
                          // Use Web Share API for Twitter
                          if (navigator.share && navigator.canShare) {
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Premium Song',
                                text: 'Just got my ExRoast premium song! 🔥🎶'
                              });
                              return;
                            }
                          }
                          // Fallback: Twitter share with video URL
                          const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(songData.fullUrl)}&text=${encodeURIComponent("Just got my ExRoast premium song! 🔥🎶")}`;
                          window.open(twitterUrl, '_blank');
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('[twitter] Share failed', err);
                            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(songData.fullUrl)}&text=${encodeURIComponent("Just got my ExRoast premium song! 🔥🎶")}`;
                            window.open(twitterUrl, '_blank');
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaTwitter /> Twitter
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Fetch the video file
                          const response = await fetch(songData.fullUrl);
                          if (!response.ok) {
                            throw new Error(`Failed to fetch video: ${response.status}`);
                          }
                          const blob = await response.blob();
                          const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          
                          // Use Web Share API for Facebook
                          if (navigator.share && navigator.canShare) {
                            if (navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Premium Song',
                                text: 'Check out my ExRoast premium song! 🔥🎶'
                              });
                              return;
                            }
                          }
                          // Fallback: Facebook share with video URL
                          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songData.fullUrl)}`;
                          window.open(facebookUrl, '_blank');
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            console.error('[facebook] Share failed', err);
                            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songData.fullUrl)}`;
                            window.open(facebookUrl, '_blank');
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaFacebook /> Facebook
                    </button>
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
