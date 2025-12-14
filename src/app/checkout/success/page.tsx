"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from 'react';
import { FaTwitter, FaFacebook, FaCopy, FaDownload, FaShare, FaTiktok, FaWhatsapp, FaInstagram } from 'react-icons/fa';

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
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null); // Track which button is loading
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [cachedVideoFile, setCachedVideoFile] = useState<File | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

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

  // Auto-preload video file when songData is available
  useEffect(() => {
    if (!songData?.fullUrl || cachedVideoFile) return;
    
    const preloadVideo = async () => {
      try {
        setIsPreloading(true);
        setShareStatus('Preparing video for sharing...');
        console.log('[preload] Starting video preload', { url: songData.fullUrl });
        
        const response = await fetch(songData.fullUrl);
        if (!response.ok) throw new Error('Failed to fetch video');
        
        const blob = await response.blob();
        const file = new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
        setCachedVideoFile(file);
        
        console.log('[preload] Video preloaded', { size: blob.size });
        setShareStatus('Video ready to share! 🎉');
        setTimeout(() => setShareStatus(null), 2000);
      } catch (err) {
        console.error('[preload] Failed to preload video', err);
        setShareStatus(null);
      } finally {
        setIsPreloading(false);
      }
    };
    
    preloadVideo();
  }, [songData?.fullUrl, songId, cachedVideoFile]);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-4xl mx-auto p-8 text-center pt-24">
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
              <p className="text-white text-lg mb-6 font-medium">Your roast is ready! 🔥</p>
              {songData?.fullUrl ? (
                <div className="space-y-6">
                  {/* Video container with centered play button */}
                  <div className="relative">
                    <video 
                      className="w-full rounded-lg shadow-lg bg-black cursor-pointer" 
                      preload="metadata"
                      playsInline
                      crossOrigin="anonymous"
                      style={{ 
                        width: "100%",
                        minHeight: "400px",
                        maxHeight: "80vh"
                      }}
                      controls
                      ref={(video) => {
                        if (video) {
                          setVideoRef(video);
                          (window as any).__videoRef = video;
                        }
                      }}
                      onClick={() => {
                        if (videoRef) {
                          if (isPlaying) {
                            videoRef.pause();
                          } else {
                            videoRef.play();
                          }
                        }
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadStart={() => {
                        console.log('[video] Load start', { url: songData.fullUrl });
                      }}
                      onError={(e) => {
                        const video = e.currentTarget;
                        console.error('[video] Error loading video', {
                          url: songData.fullUrl,
                          error: video.error?.message
                        });
                      }}
                    >
                      <source src={songData.fullUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Centered Play Button Overlay - fades when playing */}
                    {!isPlaying && (
                      <button
                        onClick={() => {
                          if (videoRef) {
                            videoRef.play();
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all duration-300 rounded-lg"
                        style={{ opacity: isPlaying ? 0 : 1 }}
                      >
                        <div className="w-20 h-20 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                          <span className="text-white text-4xl ml-1">▶</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Share status message */}
                  {(shareStatus || isPreloading) && (
                    <div className="text-center text-sm text-yellow-400 mb-2">
                      {isPreloading ? '⏳ Preparing video for instant sharing...' : shareStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                    {/* Download - Primary action */}
                    <button
                      disabled={activeButton === 'download'}
                      onClick={async () => {
                        setActiveButton('download');
                        try {
                          if (cachedVideoFile) {
                            const url = window.URL.createObjectURL(cachedVideoFile);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = cachedVideoFile.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } else {
                            window.location.href = songData.fullUrl;
                          }
                          setShareStatus('Downloaded!');
                          setTimeout(() => setShareStatus(null), 2000);
                        } catch (err) {
                          console.error('Download failed:', err);
                          window.location.href = songData.fullUrl;
                        } finally {
                          setActiveButton(null);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaDownload /> {activeButton === 'download' ? '...' : 'Download'}
                    </button>

                    {/* Share Video File - tries to share actual file */}
                    <button
                      disabled={activeButton === 'share' || isPreloading}
                      onClick={async () => {
                        setActiveButton('share');
                        try {
                          const file = cachedVideoFile || await (async () => {
                            const response = await fetch(songData.fullUrl);
                            const blob = await response.blob();
                            return new File([blob], `exroast-${songId || 'song'}.mp4`, { type: 'video/mp4' });
                          })();
                          
                          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              files: [file],
                              title: 'My ExRoast Song 🔥',
                              text: 'Check out my ExRoast song!'
                            });
                            setShareStatus('Shared!');
                          } else if (navigator.share) {
                            await navigator.share({
                              title: 'My ExRoast Song 🔥',
                              text: 'Check out my ExRoast song! 🔥🎶',
                              url: songData.fullUrl
                            });
                            setShareStatus('Shared!');
                          } else {
                            await navigator.clipboard.writeText(songData.fullUrl);
                            setShareStatus('Link copied!');
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            await navigator.clipboard.writeText(songData.fullUrl);
                            setShareStatus('Link copied!');
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaShare /> {activeButton === 'share' ? '...' : 'Share'}
                    </button>

                    {/* Copy Link */}
                    <button 
                      onClick={async () => {
                        await navigator.clipboard.writeText(songData.fullUrl);
                        setCopySuccess(true);
                        setShareStatus('Link copied!');
                        setTimeout(() => {
                          setCopySuccess(false);
                          setShareStatus(null);
                        }, 2000);
                      }} 
                      className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaCopy /> {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>

                    {/* WhatsApp */}
                    <button
                      disabled={activeButton === 'whatsapp'}
                      onClick={async () => {
                        setActiveButton('whatsapp');
                        try {
                          const file = cachedVideoFile;
                          if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({ files: [file], title: 'My ExRoast Song 🔥' });
                            setShareStatus('Shared!');
                          } else {
                            window.location.href = `https://wa.me/?text=${encodeURIComponent(`Check out my ExRoast song! 🔥🎶 ${songData.fullUrl}`)}`;
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            window.location.href = `https://wa.me/?text=${encodeURIComponent(`Check out my ExRoast song! 🔥🎶 ${songData.fullUrl}`)}`;
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaWhatsapp /> {activeButton === 'whatsapp' ? '...' : 'WhatsApp'}
                    </button>

                    {/* TikTok */}
                    <button
                      disabled={activeButton === 'tiktok'}
                      onClick={async () => {
                        setActiveButton('tiktok');
                        try {
                          const file = cachedVideoFile;
                          if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({ files: [file], title: 'My ExRoast Song 🔥' });
                            setShareStatus('Shared!');
                          } else if (file) {
                            const url = window.URL.createObjectURL(file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            setShareStatus('Downloaded! Open TikTok to upload.');
                            setTimeout(() => window.location.href = 'https://www.tiktok.com/upload', 1500);
                          } else {
                            window.location.href = 'https://www.tiktok.com/upload';
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            window.location.href = 'https://www.tiktok.com/upload';
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 3000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium border border-white/20"
                    >
                      <FaTiktok /> {activeButton === 'tiktok' ? '...' : 'TikTok'}
                    </button>

                    {/* Twitter */}
                    <button
                      disabled={activeButton === 'twitter'}
                      onClick={async () => {
                        setActiveButton('twitter');
                        try {
                          const file = cachedVideoFile;
                          if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({ files: [file], title: 'My ExRoast Song 🔥' });
                            setShareStatus('Shared!');
                          } else {
                            window.location.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(songData.fullUrl)}&text=${encodeURIComponent("Just got my ExRoast song! 🔥🎶")}`;
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            window.location.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(songData.fullUrl)}&text=${encodeURIComponent("Just got my ExRoast song! 🔥🎶")}`;
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaTwitter /> {activeButton === 'twitter' ? '...' : 'Twitter'}
                    </button>

                    {/* Facebook */}
                    <button
                      disabled={activeButton === 'facebook'}
                      onClick={async () => {
                        setActiveButton('facebook');
                        try {
                          const file = cachedVideoFile;
                          if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({ files: [file], title: 'My ExRoast Song 🔥' });
                            setShareStatus('Shared!');
                          } else {
                            window.location.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songData.fullUrl)}`;
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            window.location.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songData.fullUrl)}`;
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaFacebook /> {activeButton === 'facebook' ? '...' : 'Facebook'}
                    </button>

                    {/* Instagram */}
                    <button
                      disabled={activeButton === 'instagram'}
                      onClick={async () => {
                        setActiveButton('instagram');
                        try {
                          const file = cachedVideoFile;
                          if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({ files: [file], title: 'My ExRoast Song 🔥' });
                            setShareStatus('Shared!');
                          } else if (file) {
                            const url = window.URL.createObjectURL(file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            setShareStatus('Downloaded! Open Instagram to share.');
                          } else {
                            setShareStatus('Download the video first.');
                          }
                        } catch (err: any) {
                          if (err.name !== 'AbortError') {
                            setShareStatus('Download the video first.');
                          }
                        } finally {
                          setActiveButton(null);
                          setTimeout(() => setShareStatus(null), 3000);
                        }
                      }}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 disabled:opacity-70 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                    >
                      <FaInstagram /> {activeButton === 'instagram' ? '...' : 'Instagram'}
                    </button>
                  </div>

                  <p className="text-gray-400 text-xs mt-4">
                    {cachedVideoFile ? '✅ Video ready for instant sharing!' : '⏳ Video preloading for faster sharing...'}
                  </p>
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
