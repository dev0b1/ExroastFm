"use client";

import { useEffect, useState } from 'react';

export function SparkStorm() {
  const [sparks, setSparks] = useState<Array<{
    id: number;
    left: string;
    delay: string;
    duration: string;
    color: string;
  }>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const colors = ['#ff006e', '#ffd23f', '#ff4500'];
      const newSparks = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${2 + Math.random() * 2}s`,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setSparks(newSparks);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-10vh) scale(1);
            opacity: 0;
          }
        }

        @keyframes explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .spark {
          position: fixed;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          animation: float-up var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          background: var(--color);
          box-shadow: 0 0 6px var(--color);
          will-change: transform, opacity;
        }

        .spark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
      <div className="spark-container">
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="spark"
            style={{
              left: spark.left,
              '--delay': spark.delay,
              '--duration': spark.duration,
              '--color': spark.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
