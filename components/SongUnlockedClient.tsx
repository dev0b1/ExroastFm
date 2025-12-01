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
import { saveSongAudio, getSongObjectURL } from '../lib/offline-store';

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

interface PremiumSongMatch {
  id: string;
  title: string;
  description?: string;
  mp3?: string;
  mp4?: string;
  duration?: number;
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
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoExists, setVideoExists] = useState(false);
  const [creatingVideo, setCreatingVideo] = useState(false);
  const [premiumMp4Url, setPremiumMp4Url] = useState<string | null>(null);
  const [premiumSongId, setPremiumSongId] = useState<string | null>(null);
  const [premiumMatches, setPremiumMatches] = useState<PremiumSongMatch[] | null>(null);
  const [showPremiumSelector, setShowPremiumSelector] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewPlayingId, setPreviewPlayingId] = useState<string | null>(null);

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

  // Clear any pending single-song id once the song is purchased/viewed
  useEffect(() => {
    if (!song?.isPurchased) return;
    try { localStorage.removeItem('pendingSingleSongId'); } catch (e) { /* ignore */ }
  }, [song?.isPurchased]);

  // Check if a generated video exists in `public/generated/<songId>.mp4`
  useEffect(() => {
    if (!song?.id) return;
    let mounted = true;
    const check = async () => {
      try {
        const url = `${window.location.origin}/generated/${song.id}.mp4`;
        const res = await fetch(url, { method: 'HEAD' });
        if (!mounted) return;
        if (res.ok) setVideoExists(true);
      } catch (e) {
        // ignore - video probably doesn't exist
      }
    };
    check();
    return () => { mounted = false; };
  }, [song?.id]);

  // Create video / premium song: simplified flow
  // Deprecated: enqueueing ffmpeg jobs. New flow: fetch best-match premium pre-made songs.
  const createVideo = async () => {
    if (!song?.id || creatingVideo) return;
    setCreatingVideo(true);
    try {
      const storyParam = encodeURIComponent(song.story || '');
      // request up to 3 matches
      const res = await fetch(`/api/premium-songs?story=${storyParam}&limit=3`);
      const data = await res.json();
      if (!data?.success || !Array.isArray(data.songs) || data.songs.length === 0) {
        console.warn('No premium song matches found', data);
        setCreatingVideo(false);
        return;
      }

      // If only one match returned, auto-select it. Otherwise show selector.
      if (data.songs.length === 1) {
        const match = data.songs[0];
        if (match.mp3) setSong((s) => s ? ({ ...s, fullUrl: match.mp3!, isPurchased: true }) : s);
        if (match.mp4) {
          setPremiumMp4Url(match.mp4);
          setVideoExists(true);
        }
        setPremiumSongId(match.id || null);
        setCreatingVideo(false);
        return;
      }

      // Multiple matches: present selector to user
      setPremiumMatches(data.songs.slice(0, 3));
      setShowPremiumSelector(true);
      setCreatingVideo(false);
    } catch (e) {
      console.error('createVideo (premium) failed', e);
      setCreatingVideo(false);
    }
  };

  const selectPremiumMatch = (match: PremiumSongMatch) => {
    if (match.mp3) setSong((s) => s ? ({ ...s, fullUrl: match.mp3!, isPurchased: true }) : s);
    if (match.mp4) {
      setPremiumMp4Url(match.mp4);
      setVideoExists(true);
    }
    setPremiumSongId(match.id || null);
    setPremiumMatches(null);
    setShowPremiumSelector(false);
  };

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

  // When the song becomes purchased and a full URL is present, download and save it locally
  const savedLocalRef = useRef(false);
  useEffect(() => {
    if (!song?.isPurchased || !song.fullUrl) return;
    if (typeof window === 'undefined') return;
    if (savedLocalRef.current) return;

    (async () => {
      try {
        // fetch the full mp3 and save to IndexedDB for offline access
        const res = await fetch(song.fullUrl);
        if (!res.ok) throw new Error('Failed to fetch full audio');
        const blob = await res.blob();
        await saveSongAudio(song.id, blob);
        // update song to use local object URL for playback
        const objectUrl = URL.createObjectURL(blob);
        setSong((s) => s ? ({ ...s, fullUrl: objectUrl }) : s);

        // Add/refresh recentRoasts entry so this purchased song shows in Recent
        try {
          const raw = localStorage.getItem('recentRoasts');
          let recentRoasts = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(recentRoasts)) recentRoasts = [];
          // remove existing entry for this id
          recentRoasts = recentRoasts.filter((r: any) => r.id !== song.id);
          recentRoasts.unshift({ id: song.id, title: song.title, timestamp: new Date().toISOString() });
          localStorage.setItem('recentRoasts', JSON.stringify(recentRoasts.slice(0, 3)));
        } catch (e) {
          console.warn('Failed to update recentRoasts', e);
        }

        savedLocalRef.current = true;
      } catch (e) {
        console.warn('Failed to save song locally', e);
      }
    })();
  }, [song?.isPurchased, song?.fullUrl]);

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
                  <div className="mt-2">
                    <LyricsOverlay lyrics={song?.lyrics} duration={duration} isPlaying={isPlaying} currentTime={currentTime} />
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-300">
                        Powered by
                        <span className="ml-1 inline-block bg-white text-black text-xs font-semibold uppercase px-2 py-1 rounded">exroast.ai</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-6">
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

                    {!videoExists && (
                      <button
                        onClick={() => {
                          track('create_video_clicked', { songId: song?.id });
                          createVideo();
                        }}
                        disabled={creatingVideo}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold inline-flex items-center gap-2"
                      >
                        {creatingVideo ? 'Creating Video...' : 'Create Video'}
                      </button>
                    )}

                    {videoExists && (
                      <a
                        href={premiumMp4Url || `/generated/${song?.id}.mp4`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-exroast-pink text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2"
                        onClick={() => track('view_video', { songId: premiumSongId || song?.id })}
                      >
                        View Video
                      </a>
                    )}
                  </div>
                  
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
                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
                  />

                  {/* Premium matches selector */}
                  {showPremiumSelector && premiumMatches && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {premiumMatches.map((m) => (
                                        <div key={m.id} className="p-4 border rounded bg-[#0b0910]">
                                          <h3 className="text-white font-bold text-lg">{m.title}</h3>
                                          {m.description && <p className="text-gray-400 text-sm mt-1">{m.description}</p>}
                                          <div className="mt-3">
                                            {m.mp3 && (
                                              <div className="flex items-center gap-3">
                                                <button
                                                  onClick={() => {
                                                    try {
                                                      if (previewPlayingId === m.id) {
                                                        previewAudioRef.current?.pause();
                                                        previewAudioRef.current = null;
                                                        setPreviewPlayingId(null);
                                                        return;
                                                      }
                                                      // stop existing preview
                                                      if (previewAudioRef.current) {
                                                        previewAudioRef.current.pause();
                                                        previewAudioRef.current = null;
                                                      }
                                                      const a = new Audio(m.mp3!);
                                                      previewAudioRef.current = a;
                                                      a.play().then(() => setPreviewPlayingId(m.id)).catch(() => {});
                                                      a.onended = () => { setPreviewPlayingId(null); previewAudioRef.current = null; };
                                                    } catch (e) {
                                                      console.warn('preview play failed', e);
                                                    }
                                                  }}
                                                  className="bg-exroast-pink text-white px-3 py-2 rounded font-bold"
                                                >
                                                  {previewPlayingId === m.id ? 'Stop' : 'Play Preview'}
                                                </button>
                                                <span className="text-sm text-gray-400">Sample</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="mt-3 flex gap-2">
                                            <button onClick={() => selectPremiumMatch(m)} className="bg-exroast-pink text-white px-3 py-2 rounded font-bold">Use this song</button>
                                            <a href={m.mp3} download className="bg-white text-black px-3 py-2 rounded font-bold">Download</a>
                                          </div>
                                        </div>
                                      ))}
                    </div>
                  )}

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
