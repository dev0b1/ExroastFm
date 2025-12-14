"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
// Header provided by NavWrapper in root layout
import { SubscriptionCTA } from "@/components/SubscriptionCTA";
// import { SubscriptionModal } from "@/components/SubscriptionModal";
import { UpsellModal } from "@/components/UpsellModal";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { LoadingAnimation } from "@/components/LoadingAnimation";
// LyricsOverlay removed - now using video instead of audio
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { getSongObjectURL } from '../../lib/offline-store';
import Link from "next/link";
import { FaLock, FaDownload, FaPlay, FaPause, FaFire, FaDumbbell, FaTiktok, FaInstagram, FaWhatsapp, FaTwitter, FaLink, FaShare } from "react-icons/fa";
// daily petty opt-in removed from preview flow
// import { getDailySavageQuote } from "@/lib/suno-nudge";
import { openPrimaryCheckout, openDodoOverlayCheckout } from '@/lib/checkout';
import { SINGLE_AMOUNT } from '@/lib/pricing';

interface Song {
  id: string;
  title: string;
  previewUrl: string;
  fullUrl: string;
  lyrics: string;
  style: string;
  story: string;
  isPurchased: boolean;
  isTemplate?: boolean;
}

export default function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const songId = searchParams.get("songId");
  
  const supabase = createClientComponentClient();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showDailyQuoteOptIn, setShowDailyQuoteOptIn] = useState(false);
  const [showPreGenModal, setShowPreGenModal] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [actualDuration, setActualDuration] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const midPlayModalShownRef = useRef(false);
  const [cachedVideoFile, setCachedVideoFile] = useState<File | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    if (songId) {
      fetchSong(songId);
    }
  }, [songId]);

  // Ensure the preview page always starts scrolled to top when opened or when the songId changes.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    } catch (e) {
      // ignore
    }
  }, [songId]);

  // If there is a locally stored full audio for this song, use it.
  useEffect(() => {
    let mounted = true;
    const tryLoadLocal = async () => {
      if (!song) return;
      try {
        const url = await getSongObjectURL(song.id);
        if (mounted && url) {
          // If a local copy exists, override fullUrl and mark purchased locally
          setSong((s) => s ? ({ ...s, fullUrl: url, isPurchased: true }) : s);
        }
      } catch (e) {
        console.warn('Failed to load local audio', e);
      }
    };
    tryLoadLocal();
    return () => { mounted = false; };
  }, [song]);

  // Auto-preload video file for instant sharing
  useEffect(() => {
    if (!song?.previewUrl || cachedVideoFile || isPreloading) return;
    
    const preloadVideo = async () => {
      try {
        setIsPreloading(true);
        console.log('[preview] Preloading video for sharing', { url: song.previewUrl });
        
        const response = await fetch(song.previewUrl);
        if (!response.ok) throw new Error('Failed to fetch video');
        
        const blob = await response.blob();
        const file = new File([blob], `exroast-demo-${song.id || 'song'}.mp4`, { type: 'video/mp4' });
        setCachedVideoFile(file);
        
        console.log('[preview] Video preloaded for sharing', { size: blob.size });
      } catch (err) {
        console.error('[preview] Failed to preload video', err);
      } finally {
        setIsPreloading(false);
      }
    };
    
    preloadVideo();
  }, [song?.previewUrl, song?.id, cachedVideoFile, isPreloading]);

  // Helper function to normalize template video URLs
  const normalizeTemplateUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    console.log('[preview] Normalizing URL:', url);
    
    // If it's already a full URL (Supabase Storage), return as-is
    if (url.startsWith('http')) {
      console.log('[preview] URL is already full URL (Supabase)', url);
      return url;
    }
    
    // Convert .mp3 to .mp4 for templates (since we updated to MP4)
    let normalizedUrl = url;
    if (normalizedUrl.endsWith('.mp3')) {
      normalizedUrl = normalizedUrl.replace('.mp3', '.mp4');
      console.log('[preview] Converted .mp3 to .mp4:', normalizedUrl);
    }
    
    // Ensure local paths start with /
    if (!normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('http')) {
      normalizedUrl = `/${normalizedUrl}`;
      console.log('[preview] Added leading slash:', normalizedUrl);
    }
    
    // If it's a templates path, ensure it's correct
    if (normalizedUrl.includes('templates/') && !normalizedUrl.startsWith('/templates/')) {
      normalizedUrl = normalizedUrl.replace('templates/', '/templates/');
      console.log('[preview] Fixed templates path:', normalizedUrl);
    }
    
    console.log('[preview] Final normalized URL:', normalizedUrl);
    return normalizedUrl;
  };

  const fetchSong = async (id: string) => {
    try {
      const response = await fetch(`/api/song/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const songData = data.song;
        
        // Normalize template URLs (convert .mp3 to .mp4 if needed)
        if (songData.isTemplate) {
          songData.previewUrl = normalizeTemplateUrl(songData.previewUrl);
          songData.fullUrl = normalizeTemplateUrl(songData.fullUrl || songData.previewUrl);
        }
        
        setSong(songData);
        // Initialize edited lyrics for pre-generation modal
        setEditedLyrics(songData?.lyrics ?? "");
        
        if (typeof window !== 'undefined') {
          const hasSeenDailyQuoteOptIn = localStorage.getItem('hasSeenDailyQuoteOptIn');
          if (!hasSeenDailyQuoteOptIn) {
            setTimeout(() => {
              setShowDailyQuoteOptIn(true);
            }, 2000);
          }
        }
      } else {
        console.error("Failed to fetch song");
      }
    } catch (error) {
      console.error("Error fetching song:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyQuoteOptIn = async (audioEnabled: boolean) => {
    // Daily opt-in removed from preview flow. No-op.
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] relative flex items-center justify-center">
        <LoadingAnimation message="Loading your song..." />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-[70vh] relative flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gradient">Song not found</h1>
          <p className="text-white">Please try generating a new song</p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // reset the mid-play modal flag so replays can show the upsell again
      midPlayModalShownRef.current = false;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    // Show upsell modal mid-play for demo songs (after 20 seconds) - every time
    if (!song?.isPurchased && song?.isTemplate && !midPlayModalShownRef.current) {
      // Show modal after 20 seconds of playback
      if (current >= 20 && current < 21) {
        midPlayModalShownRef.current = true;
        setShowUpsellModal(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    
    // Show the upsell modal after preview ends for any unpurchased song - every time
    if (!song.isPurchased) {
      setTimeout(() => {
        setShowUpsellModal(true);
      }, 500);
      return;
    }
  };

  // Polling for pending guest purchases was removed per request —
  // purchases will be handled server-side and the client can refetch song state as needed.

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const loadedDuration = videoRef.current.duration;
    setActualDuration(loadedDuration);
    setDuration(loadedDuration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Open the pre-generation modal (edit lyrics or use existing)
  const openPreGenModal = () => {
    setEditedLyrics(song?.lyrics ?? "");
    setGenMessage(null);
    setShowPreGenModal(true);
  };

  const closePreGenModal = () => {
    setShowPreGenModal(false);
    setIsGenerating(false);
    setGenMessage(null);
  };

  const handleGenerate = async (useOverride: boolean) => {
    if (!song) return;
    setIsGenerating(true);
    setGenMessage(null);
    try {
      const body: any = { story: song.story, style: song.style };
      if (useOverride) body.overrideLyrics = editedLyrics;

      // Attach userId when available so server can attribute the job.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) body.userId = user.id;
      } catch (e) {
        // ignore - unauthenticated guest
      }

      // If this browser has a pending guest credit token, include it so the server
      // can recognize/attribute the request. We will also consume the local token
      // optimistically on success to allow immediate generation without waiting for webhook.
      let localToken: string | null = null;
      try {
        localToken = typeof window !== 'undefined' ? localStorage.getItem('pendingCreditToken') : null;
        if (localToken) body.pendingCreditToken = localToken;
      } catch (e) {}

      const res = await fetch('/api/generate-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        if (data.error === 'no_credits') {
          setGenMessage('No credits available. Please complete an upgrade and wait for webhook confirmation.');
        } else {
          setGenMessage(data.error || 'Generation failed. Please try again.');
        }
        setIsGenerating(false);
        return;
      }

      // Success: a song row + background job was enqueued. Inform the user.
      setGenMessage('Your personalized song has been queued — we will notify you when it is ready.');
      // If we consumed a local guest token, decrement pendingCredits and remove the token.
      if (localToken && typeof window !== 'undefined') {
        try {
          const existing = localStorage.getItem('pendingCredits');
          const existingNum = existing ? parseInt(existing, 10) : 0;
          const newNum = Math.max(0, existingNum - 1);
          localStorage.setItem('pendingCredits', String(newNum));
          localStorage.removeItem('pendingCreditToken');
        } catch (e) { console.warn('Failed to consume local pending credit token', e); }
      }
      setIsGenerating(false);
      // Close modal after a short delay
      setTimeout(() => {
        setShowPreGenModal(false);
        // Optionally navigate to app or refresh
        router.push('/app');
      }, 1200);
    } catch (error) {
      console.error('Generate error:', error);
      setGenMessage('Network error. Please try again.');
      setIsGenerating(false);
    }
  };

  let shareUrl = '';
  if (typeof window !== 'undefined') {
    if (song) {
      if (!song.isPurchased) {
        shareUrl = song.previewUrl ?? `${window.location.origin}/share/${song.id}`;
      } else {
        shareUrl = song.fullUrl ?? `${window.location.origin}/share/${song.id}`;
      }
    } else {
      // fallback to share by songId from query params when song object is not yet loaded
      shareUrl = `${window.location.origin}/share/${songId ?? ""}`;
    }
  }

  return (
    <div>
      {/* Header rendered by NavWrapper */}
      <main className="pt-32 pb-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block"
            >
              <div className="text-6xl mb-4">🔥</div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              Your Song is Ready!
            </h1>
            <p className="text-xl text-white">
              Your savage roast is ready! Listen and share 🔥
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card bg-black">
                <h3 className="text-xl font-bold text-gradient mb-4">
                  Your Breakup Story
                </h3>
                <p className="text-white italic mb-4">"{song.story}"</p>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-exroast-gold text-black rounded-full text-sm font-medium">
                    {song.style.charAt(0).toUpperCase() + song.style.slice(1)} Vibe
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card sticky top-24">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gradient">{song.title}</h3>
                    {song.isTemplate && (
                      <span className="text-xs bg-exroast-pink text-white px-3 py-1 rounded-full font-bold">
                        DEMO
                      </span>
                    )}
                  </div>

                  {/* Video Player */}
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    
                    <video
                      ref={videoRef}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleAudioEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadStart={() => {
                        const videoUrl = song.fullUrl || song.previewUrl;
                        console.log('[preview] Video load start', { url: videoUrl, isTemplate: song.isTemplate });
                      }}
                      onCanPlay={() => {
                        const videoUrl = song.fullUrl || song.previewUrl;
                        console.log('[preview] Video can play', { url: videoUrl });
                      }}
                      onLoadedData={() => {
                        const videoUrl = song.fullUrl || song.previewUrl;
                        console.log('[preview] Video loaded data', { url: videoUrl });
                      }}
                      onError={(e) => {
                        console.error('[preview] Video error:', e);
                        const video = e.currentTarget;
                        console.error('[preview] Video error details:', {
                          error: video.error?.message,
                          code: video.error?.code,
                          src: video.src,
                          currentSrc: video.currentSrc,
                          songUrl: song.fullUrl || song.previewUrl
                        });
                      }}
                      className="w-full rounded-lg"
                      style={{ maxHeight: '400px' }}
                      playsInline
                      preload="metadata"
                      controls
                    >
                      <source src={song.fullUrl || song.previewUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                  </div>

                  {/* Upgrade CTA - prominent for non-purchased */}
                  {!song?.isPurchased && (
                    <button
                      onClick={() => setShowUpsellModal(true)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                    >
                      <FaLock /> Get Your Personalized Roast
                    </button>
                  )}

                  {/* Download buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {song?.isPurchased ? (
                      <a href={song.fullUrl} download className="bg-white text-black px-4 py-2 rounded-full font-bold inline-flex items-center gap-2">
                        <FaDownload /> Download Full Video
                      </a>
                    ) : (
                      <a href={song.previewUrl} download className="bg-white/10 text-white px-4 py-2 rounded-full font-bold inline-flex items-center gap-2 border border-white/10">
                        <FaDownload /> Download Demo
                      </a>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Share Your Roast</h4>
                    <div className="flex flex-wrap gap-3">
                      {/* Share Video File Button */}
                      <button
                        disabled={isPreloading}
                        onClick={async () => {
                          try {
                            const videoUrl = song.previewUrl || song.fullUrl;
                            if (!videoUrl) return;
                            
                            const file = cachedVideoFile || await (async () => {
                              const response = await fetch(videoUrl);
                              const blob = await response.blob();
                              return new File([blob], `exroast-demo-${song.id || 'song'}.mp4`, { type: 'video/mp4' });
                            })();
                            
                            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: 'My ExRoast Demo 🔥',
                                text: 'Check out my ex roast demo! 🔥'
                              });
                            } else if (navigator.share) {
                              await navigator.share({
                                title: 'My ExRoast Demo 🔥',
                                text: 'Check out my ex roast demo! 🔥🎶',
                                url: videoUrl
                              });
                            } else {
                              // Fallback: download
                              const url = URL.createObjectURL(file);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = file.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          } catch (err: any) {
                            if (err.name !== 'AbortError') {
                              console.error('Share failed:', err);
                              // Fallback: download
                              const videoUrl = song.previewUrl || song.fullUrl;
                              if (videoUrl) {
                                const a = document.createElement('a');
                                a.href = videoUrl;
                                a.download = `exroast-demo-${song.id || 'song'}.mp4`;
                                a.click();
                              }
                            }
                          }
                        }}
                        className="bg-exroast-pink hover:bg-pink-600 text-white px-4 py-2 rounded-full font-bold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <FaShare /> {isPreloading ? 'Preparing...' : 'Share Video'}
                      </button>
                      
                      {/* Other share options - updated to share video file */}
                      <SocialShareButtons
                        url={shareUrl}
                        title={song.title}
                        message={song.isPurchased ? `I just paid $9.99 to have my ex roasted by AI and it's the best money I've ever spent 🔥🎵` : `Check out my ex roast demo! 🔥`}
                        videoFile={cachedVideoFile}
                        videoUrl={song.previewUrl || song.fullUrl}
                        isPreloading={isPreloading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {showSubscription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              {/* Pass songId so single-song purchases attach custom_data for webhook fulfillment.
                  If pendingSinglePurchase is true, autoOpenSingle will cause SubscriptionCTA to
                  immediately open the single-song checkout. */}
              <SubscriptionCTA songId={song?.id} autoOpenSingle={false} />
            </motion.div>
          )}

          
        </motion.div>
      </div>
      </main>

      
      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        story={song?.story}
        style={song?.style}
        onUpgrade={async (tier) => {
          console.log('Upgrading to:', tier);
          setShowUpsellModal(false);
          // For one-time purchases we open the single-song checkout directly
          // from the user's click. This keeps the flow explicit and avoids
          // any accidental auto-open behavior.
          if (tier === 'one-time') {
            // Open the primary checkout overlay directly (Dodo) with songId metadata.
            try {
              setShowUpsellModal(false);
              await openPrimaryCheckout({ songId: song?.id });
            } catch (e) {
              console.error('Failed to open primary checkout overlay from upsell, falling back to checkout page', e);
              try { router.push(`/checkout${song?.id ? `?songId=${song.id}` : ''}`); } catch (err) { console.error('Fallback route also failed', err); }
            }
            return;
          } else {
            setShowSubscription(true);
          }
        }}
      />

      {/* Pre-generation modal: let user edit lyrics or generate from existing */}
      {showPreGenModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closePreGenModal} />
          <div className="relative max-w-3xl w-full bg-black border border-white/10 rounded-lg p-6 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Prepare Your Personalized Song</h3>
            <p className="text-sm text-gray-300 mb-4">Edit the lyrics below, or leave as-is to let the AI generate final lyrics from your story.</p>

            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              rows={8}
              className="w-full bg-white/5 text-white p-3 rounded-md mb-4"
            />

            {genMessage && (
              <div className="text-sm text-yellow-300 mb-3">{genMessage}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button onClick={closePreGenModal} className="px-4 py-2 bg-white/5 text-white rounded">Cancel</button>
              <button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="px-4 py-2 bg-exroast-pink text-white rounded font-bold"
              >
                {isGenerating ? 'Generating...' : 'Generate (AI lyrics)'}
              </button>
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating || !editedLyrics || editedLyrics.trim().length < 10}
                className="px-4 py-2 bg-white text-black rounded font-bold"
              >
                {isGenerating ? 'Generating...' : 'Generate (use edited lyrics)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily petty power-up modal removed from preview flow */}
      {/* Mobile Bottom Navigation Bar (replicated from app/page.tsx for preview route) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-white/20 h-20">
        <div className="h-full flex items-stretch">
          <Link
            href="/app?tab=roast"
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 text-gray-400`}
          >
            <FaFire className="text-2xl" />
            <span className="text-xs font-bold">Roast</span>
          </Link>

          <Link
            href="/app?tab=daily"
            className="w-32 flex flex-col items-center justify-center bg-gradient-to-t from-purple-900/20 to-transparent border-x border-white/10"
          >
            <div className="text-lg font-black text-white leading-tight">Day</div>
            <div className="text-xs text-gray-400 font-bold">strong</div>
          </Link>

          <Link
            href="/app?tab=daily"
            className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 text-gray-400`}
          >
            <FaDumbbell className="text-2xl" />
            <span className="text-xs font-bold">Daily</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
