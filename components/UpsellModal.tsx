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
            <div className="bg-gradient-to-br from-[#0b0710] to-[#120816] rounded-2xl p-4 sm:p-6 border border-exroast-pink/20 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close upsell"
              >
                <FaTimes className="text-2xl" />
              </button>
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-white">Upgrade for Your Real Song</h2>
                <p className="text-sm text-gray-300 max-w-3xl mx-auto">This demo was a template. Choose a plan below to unlock a 100% personalized song with your names, story, and vibe — delivered as a downloadable MP3.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* One-time purchase card */}
                <div className="bg-black/60 border border-white/6 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaRocket className="text-exroast-pink text-2xl" />
                        <div>
                          <div className="text-sm text-gray-300">One-time</div>
                          <div className="text-lg font-extrabold text-white">Full Song</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Pay once</div>
                        <div className="text-2xl font-black text-white">$9.99</div>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-gray-200 text-sm">
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> Personalized lyrics & vocal mix</li>
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> MP3 download, no watermark</li>
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> One-time delivery</li>
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onUpgrade('one-time')}
                    className="mt-6 w-full bg-gradient-to-r from-pink-500 via-[#ff6aa2] to-yellow-400 text-black font-extrabold py-3 px-4 rounded-full text-lg shadow-md"
                  >
                    Buy Full Song — $9.99
                  </motion.button>
                </div>

                {/* Subscription card */}
                <div className="relative bg-gradient-to-b from-purple-900/30 to-black/40 border border-white/6 rounded-xl p-5 flex flex-col justify-between">
                  <div className="absolute -top-3 left-4 bg-exroast-pink text-black px-3 py-1 rounded-full text-xs font-bold">Most Popular</div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaCrown className="text-yellow-400 text-2xl" />
                        <div>
                          <div className="text-sm text-gray-300">Subscription</div>
                          <div className="text-lg font-extrabold text-white">Unlimited Songs</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Monthly</div>
                        <div className="text-2xl font-black text-white">$12.99/mo</div>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-gray-200 text-sm">
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> Unlimited personalized songs</li>
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> Priority generation + faster delivery</li>
                      <li className="flex items-start gap-3"><FaCheck className="text-exroast-pink mt-1" /> Download all songs</li>
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onUpgrade('unlimited')}
                    className="mt-6 w-full bg-white text-black font-extrabold py-3 px-4 rounded-full text-lg shadow-md"
                  >
                    Start Unlimited — $12.99/mo
                  </motion.button>
                </div>
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
