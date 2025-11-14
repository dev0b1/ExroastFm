"use client";

import { motion } from "framer-motion";
import { FaMusic, FaHeart } from "react-icons/fa";

interface LoadingAnimationProps {
  message?: string;
}

export function LoadingAnimation({ message = "Creating your song..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-heartbreak-500"
        >
          <FaHeart className="text-6xl" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [-20, -40, -20],
            x: [10, 30, 10],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.2,
          }}
          className="absolute -top-4 -right-4 text-heartbreak-400"
        >
          <FaMusic className="text-2xl" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [-20, -40, -20],
            x: [-10, -30, -10],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.4,
          }}
          className="absolute -top-4 -left-4 text-heartbreak-400"
        >
          <FaMusic className="text-2xl" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [20, 40, 20],
            x: [10, 30, 10],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.6,
          }}
          className="absolute -bottom-4 -right-4 text-heartbreak-400"
        >
          <FaMusic className="text-2xl" />
        </motion.div>
      </div>
      
      <div className="text-center space-y-2">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl font-semibold text-gray-700"
        >
          {message}
        </motion.p>
        <p className="text-sm text-gray-500">
          Turning your heartbreak into art ✨
        </p>
      </div>
      
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              backgroundColor: ["#f43f5e", "#fb7185", "#f43f5e"],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 rounded-full bg-heartbreak-500"
          />
        ))}
      </div>
    </div>
  );
}
