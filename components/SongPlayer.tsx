"use client";

import { useRef, useState } from "react";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import { motion } from "framer-motion";

interface SongPlayerProps {
  audioUrl: string;
  title: string;
  isPreview?: boolean;
  previewDuration?: number;
}

export function SongPlayer({
  audioUrl,
  title,
  isPreview = false,
  previewDuration = 10,
}: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    setCurrentTime(current);

    if (isPreview && current >= previewDuration) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const totalDuration = isPreview ? previewDuration : audioRef.current.duration;
    setDuration(totalDuration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          {isPreview && (
            <span className="text-xs bg-heartbreak-100 text-heartbreak-700 px-3 py-1 rounded-full font-medium">
              Preview (10s)
            </span>
          )}
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-r from-heartbreak-500 to-heartbreak-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            {isPlaying ? (
              <FaPause className="text-xl" />
            ) : (
              <FaPlay className="text-xl ml-1" />
            )}
          </motion.button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-heartbreak-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-heartbreak-500">
            <FaVolumeUp className="text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
