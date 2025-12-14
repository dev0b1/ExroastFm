"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaHeart, FaFire, FaBolt } from 'react-icons/fa';

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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md"
          >
            <div className="bg-gradient-to-br from-[#1a0a1f] via-[#0d0510] to-[#0a0a15] rounded-2xl p-6 border border-pink-500/40 shadow-2xl relative overflow-hidden">
              {/* Animated background effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Emotional header */}
              <div className="text-center mb-5 relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -3, 3, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  className="text-6xl mb-4"
                >
                  💔
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
                  They Broke Your Heart.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    Now Break the Internet.
                  </span>
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  That was just a preview. Get your <span className="text-pink-400 font-bold">full savage roast video</span> and show them what they lost. 
                  Share it everywhere — let them see you winning. 🔥
                </p>
              </div>

              {/* Emotional benefits */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-2xl">😈</div>
                  <div>
                    <span className="text-white font-semibold">Petty Satisfaction Guaranteed</span>
                    <p className="text-gray-400 text-xs">The best revenge is a viral roast song</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-2xl">🎵</div>
                  <div>
                    <span className="text-white font-semibold">Your Story, Your Roast</span>
                    <p className="text-gray-400 text-xs">Personalized to your breakup — it hits different</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="text-2xl">📱</div>
                  <div>
                    <span className="text-white font-semibold">Share Everywhere</span>
                    <p className="text-gray-400 text-xs">TikTok, Instagram, WhatsApp — let the world know</p>
                  </div>
                </div>
              </div>

              {/* Price with urgency */}
              <div className="text-center mb-4">
                <div className="inline-block bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  🔥 50% OFF — Limited Time
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-gray-500 line-through text-xl">$19.99</span>
                  <span className="text-4xl font-black text-white">$9.99</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">One-time • Instant delivery • Keep forever</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onUpgrade('one-time')}
                className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-extrabold py-4 px-6 rounded-xl text-lg shadow-xl shadow-pink-500/30 mb-3 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <FaBolt /> Get My Revenge Roast — $9.99
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ opacity: 0.3 }}
                />
              </motion.button>

              {/* Trust & social proof */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>🔒 Secure</span>
                <span>⚡ Instant</span>
                <span>💳 No subscription</span>
              </div>

              {/* Social proof */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-bold">4,200+</span> exes roasted this month 💀
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  {['😂', '🔥', '💀', '👏', '❤️'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className="text-lg"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
