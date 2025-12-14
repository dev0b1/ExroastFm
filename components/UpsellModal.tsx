"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaFire, FaDownload, FaShare, FaVideo } from 'react-icons/fa';

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
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md"
          >
            <div className="bg-gradient-to-br from-[#1a0a1f] via-[#0d0510] to-[#0a0a15] rounded-2xl p-6 border border-pink-500/30 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Fire emoji header */}
              <div className="text-center mb-4">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-5xl mb-3"
                >
                  🔥
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  That Was Just the Demo!
                </h2>
                <p className="text-gray-300 text-sm">
                  Get your <span className="text-pink-400 font-bold">personalized roast video</span> matched to your story. Download it, share it, and let your ex know what they're missing 💀
                </p>
              </div>

              {/* What you get */}
              <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <FaVideo className="text-pink-400 text-sm" />
                    </div>
                    <span className="text-white font-medium">Full HD video with music</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <FaDownload className="text-pink-400 text-sm" />
                    </div>
                    <span className="text-white font-medium">Download & keep forever</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <FaShare className="text-pink-400 text-sm" />
                    </div>
                    <span className="text-white font-medium">Share to TikTok, Instagram, WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <FaFire className="text-pink-400 text-sm" />
                    </div>
                    <span className="text-white font-medium">Matched to your story & vibe</span>
                  </div>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-400 line-through text-lg">$19.99</span>
                  <span className="text-3xl font-black text-white">$9.99</span>
                </div>
                <p className="text-xs text-gray-400">One-time payment • No subscription</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpgrade('one-time')}
                className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg shadow-pink-500/25 mb-3"
              >
                Get My Roast Video — $9.99
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                Instant delivery • Secure checkout
              </p>

              {/* Social proof */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-gray-400">
                  🎵 <span className="text-white font-medium">2,847 roasts</span> created this week
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
