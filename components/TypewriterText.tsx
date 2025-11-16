"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TypewriterText({ text, delay = 0, className = '' }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timeout);
      }
    }, delay);
    return () => clearTimeout(startTimeout);
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayText.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            textShadow: [
              "0 0 0px #ffd23f",
              "0 0 10px #ffd23f",
              "0 0 5px #ffd23f"
            ]
          }}
          transition={{ 
            duration: 0.3,
            delay: i * 0.05,
            textShadow: {
              duration: 0.5,
              repeat: 1
            }
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
