"use client";

import { Suspense } from "react";
import CheckoutContent from "./checkout-content";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export const dynamic = 'force-dynamic';

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center space-y-4"
      >
        <FaSpinner className="text-5xl text-exroast-gold animate-spin mx-auto" />
        <h2 className="text-3xl font-bold text-white">Loading checkout...</h2>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
