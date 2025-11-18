'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LyricsOverlayProps {
  lyrics?: string | null;
  duration?: number;
  isPlaying: boolean;
}

export function LyricsOverlay({ lyrics, duration = 60, isPlaying }: LyricsOverlayProps) {
  const [scrollPosition, setScrollPosition] = useState(0);

  // Guard against undefined/null lyrics coming from the server
  const safeLyrics = typeof lyrics === 'string' ? lyrics : '';
  const lyricsLines = safeLyrics.split('\n').filter(line => line.trim() !== '');

  useEffect(() => {
    if (!isPlaying) {
      setScrollPosition(0);
      return;
    }

    const totalLines = lyricsLines.length;
    const pixelsPerSecond = (totalLines * 80) / duration;

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const newPosition = prev + (pixelsPerSecond / 30);
        if (newPosition >= totalLines * 80) {
          return 0;
        }
        return newPosition;
      });
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, [isPlaying, duration, lyricsLines.length]);

  useEffect(() => {
    setScrollPosition(0);
  }, [duration]);

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-heartbreak-50 to-white border border-heartbreak-200">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-80"></div>
      </div>

      <motion.div
        className="relative px-8 py-12"
        animate={{
          y: -scrollPosition,
        }}
        transition={{
          duration: 0,
        }}
      >
        <div className="space-y-6">
          {lyricsLines.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: isPlaying ? [0.3, 1, 1, 0.3] : 0.5,
                scale: isPlaying ? [1, 1.05, 1.05, 1] : 1,
              }}
              transition={{
                duration: duration / lyricsLines.length,
                delay: (index * duration) / lyricsLines.length,
                repeat: Infinity,
                repeatDelay: 0,
              }}
              className="text-xl md:text-3xl font-bold text-center text-gray-800 leading-relaxed"
              style={{
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-bold text-gray-500">
              ▶️ Press play to see lyrics
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
