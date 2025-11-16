"use client";

import { motion } from "framer-motion";

export function DemoVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative max-w-2xl mx-auto mt-8"
    >
      <div className="relative rounded-2xl overflow-hidden border-2 border-exroast-gold shadow-2xl shadow-exroast-pink/30">
        {/* Placeholder for demo video - using a styled div with fire animation */}
        <div className="relative bg-gradient-to-br from-exroast-black via-gray-900 to-exroast-black aspect-video flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 20px #ffd23f",
                  "0 0 40px #ffd23f",
                  "0 0 20px #ffd23f"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl font-black text-exroast-gold"
            >
              You ghosted? Here&apos;s your diss track 😈
            </motion.div>
            <div className="text-6xl animate-fire emoji-enhanced">🔥</div>
          </div>
        </div>
        
        {/* Caption overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <p className="text-center text-white font-bold text-sm">
            Sample Roast: Petty Ex Flex 🔥 <span className="text-exroast-gold">(Click to hear the savage)</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
