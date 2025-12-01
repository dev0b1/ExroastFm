"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaStar, FaShieldAlt, FaLock } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AuthAwareCTA from "@/components/AuthAwareCTA";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { SINGLE_AMOUNT } from '@/lib/pricing';
import { openSingleCheckout } from '@/lib/checkout';

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
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
              Pricing That Slaps 🔥
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto mb-6">
              From free templates to personalized AI roasts. Pick your savage level 💅
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-white bg-gray-900/50 px-6 py-3 rounded-full border border-exroast-gold/30">
                <FaShieldAlt className="text-exroast-gold" />
                <span className="text-sm">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-gray-900/50 px-6 py-3 rounded-full border border-exroast-gold/30">
                <FaLock className="text-exroast-gold" />
                <span className="text-sm">Secure Paddle Payments</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="card text-center relative overflow-hidden tier-card"
            >
              <h3 className="text-2xl font-bold text-gradient mb-2">Free</h3>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                $0
              </div>
              <p className="text-gray-400 text-sm mb-6">Instant Vibe-Matched Teasers</p>
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
                  <span>Watermarked shares</span>
                </li>
              </ul>
              <AuthAwareCTA className="btn-secondary w-full">
                Try Free Now
              </AuthAwareCTA>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="card text-center relative overflow-hidden tier-card"
            >
              <h3 className="text-2xl font-bold text-gradient mb-2">One-Time Pro</h3>
              <div className="text-5xl font-bold text-exroast-gold mb-6">
                {`$${SINGLE_AMOUNT.toFixed(2)}`}
              </div>
              <p className="text-gray-400 text-sm mb-6">Unlock Your Custom Diss (One-Time Flex)</p>
              <ul className="space-y-4 text-left mb-8">
                <li className="flex items-start space-x-3">
                  <FaCheck className="text-exroast-gold mt-1 flex-shrink-0" />
                  <span className="font-medium">Tailored AI song</span>
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
              </ul>
              <button
                className="btn-primary w-full"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    openSingleCheckout();
                  }
                }}
              >
                Get One Song
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <div className="card bg-gradient-to-r from-gray-900 to-black border-2 border-exroast-pink/30">
              <h3 className="text-3xl font-black text-exroast-gold mb-8 text-center">
                Why Upgrade to Pro? 🔥
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-exroast-gold/30">
                      <th className="pb-4 text-white font-bold text-lg">Feature</th>
                      <th className="pb-4 text-gray-400 font-bold text-lg text-center">Free</th>
                      <th className="pb-4 text-exroast-gold font-bold text-lg text-center">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    <tr>
                      <td className="py-4 text-white">Song Type</td>
                      <td className="py-4 text-gray-400 text-center">Template Library</td>
                      <td className="py-4 text-white text-center font-medium">Custom AI Generated</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Personalization</td>
                      <td className="py-4 text-gray-400 text-center">Generic roasts</td>
                      <td className="py-4 text-white text-center font-medium">YOUR story details</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Screenshot Upload</td>
                      <td className="py-4 text-gray-400 text-center">❌</td>
                      <td className="py-4 text-exroast-gold text-center font-medium">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">AI Reads Chats for Ultra-Petty Lines 💅</td>
                      <td className="py-4 text-gray-400 text-center">❌</td>
                      <td className="py-4 text-exroast-gold text-center font-medium">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Song Length</td>
                      <td className="py-4 text-gray-400 text-center">15s preview</td>
                      <td className="py-4 text-white text-center font-medium">Full 30-35s</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Watermark</td>
                      <td className="py-4 text-gray-400 text-center">Yes</td>
                      <td className="py-4 text-exroast-gold text-center font-medium">None</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">MP3 Download</td>
                      <td className="py-4 text-gray-400 text-center">❌</td>
                      <td className="py-4 text-exroast-gold text-center font-medium">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="card">
              <h3 className="text-2xl font-bold text-gradient mb-6 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">Safe Sharing: 100% Anonymous</h4>
                  <p className="text-white">
                    Your privacy matters. All songs are completely anonymous - no names, no emails, 
                    no identifiable info. Share your roast without worrying about your ex finding out it's you.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I buy individual songs instead?</h4>
                  <p className="text-white">
                    Yes! You can purchase individual full songs for $4.99 each if you don't 
                    want a subscription. Just generate your song and choose the one-time purchase option.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Do unused songs roll over?</h4>
                  <p className="text-white">
                    With Unlimited Pro, you get truly unlimited songs - no credits, no counting. 
                    Generate as many roasts as you want, whenever you want.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mb-8"
          >
            <div className="flex items-center gap-3 bg-gray-900/50 px-8 py-4 rounded-lg border border-gray-800">
              <div className="text-3xl">🎵</div>
              <div>
                <div className="text-white font-bold">Powered by Suno</div>
                <div className="text-gray-400 text-sm">AI Music Generation</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 px-8 py-4 rounded-lg border border-gray-800">
              <FaLock className="text-exroast-gold text-2xl" />
              <div>
                <div className="text-white font-bold">Secure Paddle</div>
                <div className="text-gray-400 text-sm">Safe Payments</div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      
      <style jsx global>{`
        @keyframes goldPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 210, 63, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 210, 63, 0.6);
          }
        }
        
        .tier-card {
          animation: goldPulse 2s ease-in-out infinite;
          will-change: box-shadow;
        }
        
        .tier-card:hover {
          animation: goldPulse 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
