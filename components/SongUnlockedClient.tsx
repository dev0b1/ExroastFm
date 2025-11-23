"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { LyricsOverlay } from "@/components/LyricsOverlay";
import { FaDownload, FaPlay, FaPause } from "react-icons/fa";

interface Song {
  id: string;
  title: string;
  previewUrl: string;
  fullUrl: string;
  lyrics: string;
  style: string;
  story: string;
  isPurchased: boolean;
}

export default function SongUnlockedClient() {
  const searchParams = useSearchParams();
  const songId = searchParams.get('songId');
  const router = useRouter();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!songId) return;
    let mounted = true;

    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/song/${songId}`);
        const data = await res.json();
        if (data?.success && mounted) {
          setSong(data.song);
        }
      } catch (e) {
        console.error('Failed to fetch song', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSong();

    return () => { mounted = false; };
  }, [songId]);

  // Poll until purchase is registered (webhook) and fullUrl becomes available.
  useEffect(() => {
    if (!songId) return;
    if (song?.isPurchased) return; // already purchased

    let attempts = 0;
    const maxAttempts = 20;
    setPolling(true);

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/song/${songId}`);
        const data = await res.json();
        if (data?.success) {
          setSong(data.song);
          if (data.song.isPurchased) {
            clearInterval(interval);
            setPolling(false);
            // auto-play once the fullUrl is available
            setTimeout(() => {
                if (audioRef.current) {
                audioRef.current.play().catch(() => {});
                setIsPlaying(true);
              }
            }, 400);
            return;
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [songId, song?.isPurchased]);

  useEffect(() => {
    // If song becomes purchased and fullUrl is present, autoplay
    if (song?.isPurchased && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      // no auto-download: user should click Download manually
    }
  }, [song?.isPurchased]);

  const track = (eventName: string, props?: Record<string, any>) => {
    try {
      // GA dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ event: eventName, ...props });
    } catch (e) {
      // ignore
    }

    try {
      // Generic analytics (Mixpanel/Segment/other)
      (window as any).analytics?.track?.(eventName, props || {});
    } catch (e) {
      // ignore
    }

    // always log for visibility in consoles
    try { console.log('[analytics]', eventName, props); } catch (e) {}
  };

  if (!songId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No song specified</h2>
          <p className="text-gray-500">Try returning to the app and unlocking a song.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="text-6xl">🔥🎵</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Full Song Unlocked 🔥🎵</h1>
            <p className="text-white">Your ex just got ended in 4K.</p>
          </div>

          <div className="mt-8">
            <div className="card text-center space-y-6">
              {loading ? (
                <LoadingAnimation message={polling ? 'Finalizing your song...' : 'Loading your song...'} />
              ) : (
                <>
                  <audio
                    ref={audioRef}
                    src={song?.isPurchased ? song.fullUrl : (song?.previewUrl || '')}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => {
                      try {
                        const d = (e.target as HTMLAudioElement).duration || 60;
                        setDuration(d);
                        track('song_unlocked_loaded', { songId, duration: d });
                      } catch (e) {}
                    }}
                  />

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        if (!audioRef.current) return;
                        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
                        else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
                      }}
                      className="bg-exroast-pink text-white px-6 py-3 rounded-full font-bold"
                    >
                      {isPlaying ? <><FaPause className="inline mr-2"/> Pause</> : <><FaPlay className="inline mr-2"/> Play Full Song</>}
                    </button>

                    {song?.isPurchased && (
                      <a href={song.fullUrl} download className="bg-white text-black px-6 py-3 rounded-full font-bold inline-flex items-center gap-2" onClick={() => track('download_clicked', { songId })}>
                        <FaDownload /> Download MP3
                      </a>
                    )}
                  </div>

                  <div className="mt-6">
                    <LyricsOverlay lyrics={song?.lyrics} duration={duration} isPlaying={isPlaying} />
                  </div>

                  <p className="text-gray-400 mt-4">Share this masterpiece and watch them cry</p>

                  {song?.isPurchased && (
                    <div className="mt-4">
                      <SocialShareButtons
                        songId={song.id}
                        title={song.title}
                        message={"I just paid $4.99 to have my ex roasted by AI and it’s the best money I’ve ever spent 🔥🎵"}
                        onShare={(provider) => track('share_clicked', { provider, songId: song.id })}
                      />
                    </div>
                  )}

                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
