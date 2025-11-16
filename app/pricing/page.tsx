"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaStar, FaCrown } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SubscriptionCTA } from "@/components/SubscriptionCTA";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
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
              Pick your savage level. Free preview or go full roast mode 💅
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
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $0
              </div>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>10-second song previews</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>All song styles (Sad, Savage, Healing)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Share previews on social media</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Unlimited song generations</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-primary w-full">
                  Try Free Now
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="card text-center border-4 border-exroast-pink relative shadow-2xl"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-exroast-pink text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Most Popular
              </div>
              <div className="flex items-center justify-center mb-2">
                <FaStar className="text-exroast-gold text-2xl mr-2" />
                <h3 className="text-2xl font-bold text-white">Standard</h3>
              </div>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $9
                <span className="text-xl text-white">/month</span>
              </div>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">5 full songs per month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>All song styles</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>HD audio quality</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Download MP3 files</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Full social sharing</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-primary w-full">
                  Get Started
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="card text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <FaCrown className="text-exroast-gold text-2xl mr-2" />
                <h3 className="text-2xl font-bold text-white">Premium</h3>
              </div>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $19
                <span className="text-xl text-white">/month</span>
              </div>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">20 full songs per month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>All Standard features</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">AI breakup advice</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">No-contact tips & guidance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span>Early access to new features</span>
                </li>
              </ul>
              <Link href="/story">
                <button className="btn-primary w-full">
                  Go Premium
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
