"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    try {
      setIsTouchDevice(typeof window !== 'undefined' && 'ontouchstart' in window);
    } catch (e) {
      setIsTouchDevice(false);
    }
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // On touch devices, render children only (tooltips block inputs). No touch-triggered tooltip.
  if (isTouchDevice) {
    return (
      <div className="relative inline-block">
        {children}
      </div>
    );
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${positionClasses[position]} z-50 whitespace-nowrap`}
          >
            <div className="bg-gradient-to-r from-exroast-pink to-exroast-gold text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg border border-exroast-gold/50">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-exroast-pink"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
