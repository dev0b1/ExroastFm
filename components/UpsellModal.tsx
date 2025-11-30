"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaCrown, FaRocket, FaImage } from 'react-icons/fa';
import {
  SINGLE_LABEL,
  SINGLE_BUTTON_TEXT,
  PREMIUM_LABEL,
  PREMIUM_BUTTON_TEXT,
} from '@/lib/pricing';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'one-time' | 'unlimited') => void;
}

export function UpsellModal({ isOpen, onClose, onUpgrade }: UpsellModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto px-4"
          >
            <div className="bg-gradient-to-br from-[#0b0710] to-[#120816] rounded-2xl p-6 sm:p-8 border border-exroast-pink/30 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close upsell"
              >
                <FaTimes className="text-2xl" />
              </button>

              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 text-white">
                  Demo Over 🔥
                </h2>
                <div className="text-sm sm:text-base text-gray-300 max-w-[46rem] mx-auto leading-relaxed whitespace-pre-line">
                  {`This was just a template.
Your real version will be 100% custom-written
with your names, your story, and your chosen vibe.`}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4">
                <ul className="max-w-[48rem] mx-auto space-y-2 text-gray-200 text-sm sm:text-base text-left">
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>✓ Lyrics about "he cheated" + your exact details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>✓ High-quality vocals + clean mastering</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>✓ Downloadable MP3 + no watermark</span>
                  </li>
                </ul>
              </div>

              <div className="text-center mb-4">
                <div className="text-lg font-extrabold text-white mb-3">Get Your Real Song – $4.99</div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpgrade('one-time')}
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-500 via-[#ff6aa2] to-yellow-400 text-black font-extrabold py-3 px-6 rounded-full text-lg shadow-2xl"
                >
                  Unlock Full Song →
                </motion.button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => onUpgrade('unlimited')}
                  className="text-sm text-gray-300 hover:text-white underline"
                >
                  Or go unlimited – $12.99/mo
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">All roasts are generated for entertainment only. Keep it light-hearted!</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
