"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaStar, FaCrown } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SubscriptionCTA } from "@/components/SubscriptionCTA";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
              Pricing That Slaps 🔥
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              From free templates to personalized AI roasts. Pick your savage level 💅
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="card text-center"
            >
              <h3 className="text-2xl font-bold text-gradient mb-2">Free</h3>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $0
              </div>
              <p className="text-gray-400 text-sm mb-6">Template Library</p>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Fun library templates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Matched to your vibe & mode</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>15-second previews</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>All roast styles</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-gray-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 line-through">Personalized lyrics</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-gray-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 line-through">Screenshot upload</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-secondary w-full">
                  Try Free Now
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="card text-center"
            >
              <h3 className="text-2xl font-bold text-gradient mb-2">One-Time Pro</h3>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $4.99
              </div>
              <p className="text-gray-400 text-sm mb-6">Single Full Song</p>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">Tailored Suno AI song</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Personalized from YOUR story</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Full 30-35s song</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>No watermark</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Download MP3</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-gray-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-600 line-through">Screenshot upload</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-primary w-full">
                  Get One Song
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="card text-center border-4 border-exroast-pink relative shadow-2xl"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-exroast-pink text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
              <div className="flex items-center justify-center mb-2">
                <FaCrown className="text-exroast-gold text-2xl mr-2" />
                <h3 className="text-2xl font-bold text-gradient">Unlimited Pro</h3>
              </div>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $12.99
                <span className="text-xl text-white">/month</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Unlimited Everything</p>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">UNLIMITED personalized songs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">Upload chat screenshots</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Hyper-personal roasts from your texts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Ultra-petty digs on ex's exact crimes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">Unlimited history & saves</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Clean MP3 downloads (no watermark)</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-primary w-full">
                  Go Unlimited
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <div className="card bg-gradient-to-r from-gray-900 to-black border-2 border-exroast-pink/30">
              <h3 className="text-3xl font-black text-exroast-gold mb-6 text-center">
                Why Upgrade to Pro? 🔥
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Free Templates:</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>✓ Generic fun roasts from our library</li>
                    <li>✓ No API cost - budget friendly</li>
                    <li>✓ Quick 15s previews matched to your vibe</li>
                    <li>✗ Not YOUR ex's specific drama</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-exroast-gold mb-4">Pro Personalized Songs:</h4>
                  <ul className="space-y-2 text-white">
                    <li>🔥 <strong>Suno AI generates from YOUR story</strong></li>
                    <li>🔥 <strong>Upload screenshots for REAL tea</strong></li>
                    <li>🔥 <strong>More relatable, not robotic</strong></li>
                    <li>🔥 <strong>Your ex's EXACT crimes roasted fresh</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">Can I cancel anytime?</h4>
                  <p className="text-white">
                    Yes! You can cancel your subscription at any time. No questions asked, 
                    and you'll keep access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">What payment methods do you accept?</h4>
                  <p className="text-white">
                    We accept all major credit cards, debit cards, PayPal, and Apple Pay 
                    through our secure payment provider Paddle.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I buy individual songs instead?</h4>
                  <p className="text-white">
                    Yes! You can purchase individual full songs for $2.99 each if you don't 
                    want a subscription. Just generate your song and choose the one-time purchase option.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Do unused songs roll over?</h4>
                  <p className="text-white">
                    Song credits reset each month and don't roll over. This keeps our pricing 
                    simple and fair for everyone.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
