"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaHeart, FaMusic, FaArrowRight, FaCheck } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24">
        <section className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient">💔 Turn Your</span>
                <br />
                <span className="text-gradient">Breakup Into</span>
                <br />
                <span className="text-gradient">a Song 🎵</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Personalized AI breakup songs you can share, laugh, or cry to.
                Transform your heartbreak into a musical masterpiece in minutes.
              </p>
              
              <Link href="/story">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Create My Song</span>
                  <FaArrowRight />
                </motion.button>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaCheck className="text-heartbreak-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCheck className="text-heartbreak-500" />
                  <span>Free preview</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <FaHeart className="text-[200px] text-heartbreak-400 opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-1 bg-heartbreak-600 transform rotate-45 origin-center" />
                  </div>
                </motion.div>
                
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -100],
                      x: [0, (i % 2 === 0 ? 1 : -1) * 50],
                      opacity: [0, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute"
                    style={{
                      left: `${50 + Math.cos((i * Math.PI) / 4) * 40}%`,
                      top: `${50 + Math.sin((i * Math.PI) / 4) * 40}%`,
                    }}
                  >
                    <FaMusic className="text-3xl text-heartbreak-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="section-container bg-white/50">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your personalized breakup anthem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Share Your Story",
                description: "Tell us about your breakup in a sentence or two. Don't hold back!",
                icon: "💭",
              },
              {
                step: "2",
                title: "Choose Your Vibe",
                description: "Pick from Sad, Savage, or Healing. We'll match the mood.",
                icon: "🎨",
              },
              {
                step: "3",
                title: "Get Your Song",
                description: "Listen to your preview, then unlock and share the full track!",
                icon: "🎵",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-sm font-bold text-heartbreak-500 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Features That Help You Heal
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to transform your heartbreak into art
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎵",
                title: "AI-Generated Music",
                description: "Unique, original songs crafted specifically from your story and emotions",
              },
              {
                icon: "💖",
                title: "Multiple Moods",
                description: "Choose from Sad, Savage, or Healing vibes to match your current state",
              },
              {
                icon: "📲",
                title: "Easy Sharing",
                description: "Share your song on TikTok, Instagram, WhatsApp and more with one click",
              },
              {
                icon: "🎧",
                title: "HD Audio Quality",
                description: "Professional-quality sound that captures every emotion perfectly",
              },
              {
                icon: "💬",
                title: "AI Advice (Premium)",
                description: "Get personalized breakup guidance and no-contact support from AI",
              },
              {
                icon: "⚡",
                title: "Instant Generation",
                description: "Your personalized song is ready in minutes, not hours or days",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="faq" className="section-container bg-white/50">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How does the AI create my song?",
                a: "Our AI analyzes your breakup story and selected mood to compose a unique, personalized song with lyrics and melody that capture your emotions.",
              },
              {
                q: "Can I really share my song on social media?",
                a: "Absolutely! Once you unlock the full song, you can download it and share it anywhere - TikTok, Instagram, WhatsApp, or wherever you want.",
              },
              {
                q: "Is my breakup story private?",
                a: "Yes! Your story and generated songs are completely private. We never share your personal information or content without your permission.",
              },
              {
                q: "How long does it take to generate a song?",
                a: "Most songs are ready in just a few minutes. You'll see a preview first, and can unlock the full song whenever you're ready.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="about-ai" className="section-container">
          <div className="card max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About Our AI Technology
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Our breakup song generator uses advanced AI music generation technology 
              powered by ElevenLabs Music API. Each song is uniquely crafted based on 
              your story, ensuring that no two songs are ever the same. The AI understands 
              emotional context and musical composition to create authentic, moving pieces 
              that truly capture your feelings.
            </p>
            <p className="text-sm text-gray-500">
              All songs are generated in real-time and are 100% original compositions.
            </p>
          </div>
        </section>

        <section className="section-container bg-gradient-to-r from-heartbreak-500 to-heartbreak-600 text-white rounded-3xl">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Turn Your Pain Into Art?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands who've transformed their heartbreak into something beautiful
            </p>
            <Link href="/story">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-heartbreak-600 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                Create My Song Now
              </motion.button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
