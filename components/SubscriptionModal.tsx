'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Demo Over 🔥</h2>
                <p className="text-gray-600 max-w-[36rem] mx-auto">
                  This was just a template. Your real version will be 100% custom-written with your names, your story, and your chosen vibe.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-left w-full">
                <div className="flex items-start gap-3">
                  <FaCheck className="text-exroast-pink mt-1" />
                  <span>✓ Lyrics about "he cheated" + your exact details</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheck className="text-exroast-pink mt-1" />
                  <span>✓ High-quality vocals + clean mastering</span>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheck className="text-exroast-pink mt-1" />
                  <span>✓ Downloadable MP3 + no watermark</span>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <Link href="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-500 via-[#ff6aa2] to-yellow-400 text-black px-6 py-4 rounded-full font-extrabold text-lg shadow-2xl"
                  >
                    Unlock Full Song →
                  </motion.button>
                </Link>

                <Link href="/pricing">
                  <button className="w-full text-gray-600 hover:text-gray-800 font-medium transition-colors">
                    Or go unlimited – $12.99/mo
                  </button>
                </Link>
              </div>

              <p className="text-xs text-gray-500">Join 10,000+ people turning their stories into powerful music.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
