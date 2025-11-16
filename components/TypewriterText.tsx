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
        }, 15);
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
            opacity: 1
          }}
          transition={{ 
            duration: 0.15,
            delay: i * 0.015,
            ease: "linear"
          }}
          style={{
            willChange: 'opacity'
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
