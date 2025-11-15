"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaBars, FaTimes } from "react-icons/fa";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect-soft border-b border-rose-100"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-rose-400"
            >
              <FaHeart className="text-2xl animate-heartbeat" />
            </motion.div>
            <span className="text-xl font-bold text-gradient-soft">
              HeartHeal
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium"
            >
              FAQ
            </Link>
            <Link href="/story">
              <button className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-rose-500 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 pb-4 space-y-4"
            >
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium py-2"
              >
                Pricing
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-rose-500 transition-colors duration-200 font-medium py-2"
              >
                FAQ
              </Link>
              <Link href="/story" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                  Get Started
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
