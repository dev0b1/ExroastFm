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
            onClick={onClose}
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
                  This Was Only a Demo — Get Your Personalized Version 🎵
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-[46rem] mx-auto leading-relaxed">
                  This track was a template demo.
                  <br />
                  Your personalized version will be fully rewritten using your story, your details, and your chosen style.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6 mb-4">
                <ul className="max-w-[48rem] mx-auto space-y-3 text-gray-200 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>Custom lyrics tailored to your breakup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>Your tone, names, emotions, and situation woven into the song</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>High-quality mastering + clean audio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheck className="text-exroast-pink mt-1 flex-shrink-0" />
                    <span>Delivered instantly after purchase</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center mb-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpgrade('one-time')}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ff6aa2] to-[#ffd23f] text-black font-extrabold py-3 px-6 rounded-full text-lg shadow-lg"
                >
                  Get My Personalized Song – $4.99
                </motion.button>

                <button
                  onClick={() => onUpgrade('unlimited')}
                  className="text-sm text-gray-300 underline hover:text-white bg-transparent px-2 py-1"
                >
                  Or unlock unlimited personalized tracks weekly
                </button>
              </div>

              <p className="text-center text-gray-400 text-sm mt-2">
                Join 10,000+ people turning their stories into powerful music.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
