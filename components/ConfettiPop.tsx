"use client";

import { useEffect } from 'react';

interface ConfettiPopProps {
  show: boolean;
  onComplete?: () => void;
}

export function ConfettiPop({ show, onComplete }: ConfettiPopProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <>
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }

        .confetti {
          position: absolute;
          font-size: 24px;
          animation: confetti-fall var(--duration) ease-in-out forwards;
          animation-delay: var(--delay);
        }
      `}</style>
      <div className="confetti-container">
        {Array.from({ length: 30 }, (_, i) => {
          const emojis = ['🔥', '💅', '👑', '💖'];
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          return (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                '--delay': `${Math.random() * 0.5}s`,
                '--duration': `${2 + Math.random()}s`,
              } as React.CSSProperties}
            >
              {emoji}
            </div>
          );
        })}
      </div>
    </>
  );
}
