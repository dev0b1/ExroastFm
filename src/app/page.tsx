"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaFire, FaDumbbell } from "react-icons/fa";
// Header/Footer provided by NavWrapper in root layout
import { AnimatedBackground } from "@/components/AnimatedBackground";
import StructuredData from "@/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.exroast.buzz";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ExRoast.buzz",
  "description": "Create a savage 60-second AI roast song about your ex. Turn your breakup, heartbreak, or anger into a TikTok-viral diss track with personalized AI-generated music. Perfect for breakup closure, ex roast, heartbreak healing, and breakup revenge.",
  "url": siteUrl,
  "applicationCategory": "MusicApplication",
  "operatingSystem": "Web",
  "keywords": "ex roast, breakup song, heartbreak music, angry breakup song, ex roast generator, breakup closure, breakup revenge, ex diss track, heartbreak anthem, breakup healing",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free templates available, premium personalized songs starting at $9.99"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1000"
  },
  "featureList": [
    "AI-generated breakup roast songs",
    "60-second personalized diss tracks",
    "Heartbreak music generation",
    "Angry breakup song creator",
    "Ex roast generator",
    "Breakup closure anthems",
    "Breakup revenge tracks",
    "Free template library",
    "TikTok-viral ready",
    "Instant generation",
    "Social media sharing"
  ]
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I create an ex roast song?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply enter your breakup story, choose your style (roast or glow-up), and our AI will generate a personalized 60-second diss track about your ex. You can try free templates or upgrade for a fully customized song."
      }
    },
    {
      "@type": "Question",
      "name": "Is ExRoast.buzz free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We offer free template songs that you can preview and share. For a fully personalized AI-generated roast song based on your specific breakup story, you can purchase a one-time song for $9.99."
      }
    },
    {
      "@type": "Question",
      "name": "Can I share my ex roast song on TikTok?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! All songs are designed to be TikTok-viral ready. You can download your song and share it on TikTok, Instagram, WhatsApp, Twitter, and other social media platforms."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create a song about my heartbreak or breakup anger?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! ExRoast.buzz is perfect for expressing heartbreak, breakup anger, or any breakup emotions. Our AI understands all aspects of breakups and creates personalized songs that help with breakup closure and healing."
      }
    },
    {
      "@type": "Question",
      "name": "Is this good for breakup closure and moving on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! Many users find creating an ex roast song helps with breakup closure, processing breakup anger, and moving on. It's a healthy way to express breakup emotions and find breakup strength through music."
      }
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={faqStructuredData} />
      <div className="min-h-screen bg-black relative">
        <AnimatedBackground />
        <div className="relative z-10">
          
          <main className="pt-24 pb-20 px-4">
            {/* Hero Section */}
            <section className="max-w-6xl mx-auto text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight text-white">
                  Turn your breakup into<br />
                  <span className="text-gradient">savage closure</span>
                </h1>
                <p className="text-3xl md:text-4xl font-black text-exroast-gold">
                  …and daily glow-ups 🔥
                </p>
                {/* SEO-friendly description text */}
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mt-6">
                  Create a personalized AI breakup roast song in seconds. Generate savage diss tracks, ex roast music, heartbreak anthems, angry breakup songs, and petty revenge tracks that are TikTok-viral ready. Perfect for breakup closure, heartbreak healing, and expressing ex anger. Free templates available or upgrade for a custom AI-generated song based on your breakup story.
                </p>
              </motion.div>

            {/* Two Big Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-16 max-w-5xl mx-auto">
              {/* Roast Your Ex Card */}
              <Link href="/template">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="card border-4 border-exroast-pink hover:border-exroast-gold cursor-pointer h-full min-h-[400px] flex flex-col justify-between bg-gradient-to-br from-exroast-pink/10 to-black hover:shadow-[0_0_40px_rgba(255,105,180,0.4)] transition-all duration-300"
                >
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="text-8xl emoji-enhanced"
                    >
                      🔥
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-gradient">
                      ROAST YOUR EX
                    </h2>
                    <p className="text-xl md:text-2xl text-white font-bold">
                      60-second AI diss track<br />that ends them
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="btn-primary w-full text-xl py-4 flex items-center justify-center gap-3">
                      <span>Create My Roast</span>
                      <FaFire />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Daily Glow-Up Card */}
              <Link href="/daily">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="card border-4 border-purple-500 hover:border-exroast-gold cursor-pointer h-full min-h-[400px] flex flex-col justify-between bg-gradient-to-br from-purple-900/20 via-exroast-gold/10 to-black hover:shadow-[0_0_40px_rgba(138,43,226,0.4)] transition-all duration-300"
                >
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="text-8xl emoji-enhanced"
                    >
                      💪
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-exroast-gold bg-clip-text text-transparent">
                      DAILY GLOW-UP
                    </h2>
                    <p className="text-xl md:text-2xl text-white font-bold">
                      Vent & get motivation<br />every single day
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="btn-secondary w-full text-xl py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700">
                      <span>Check In Today</span>
                      <FaDumbbell />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* SEO Content Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="max-w-4xl mx-auto mt-20 space-y-8 text-left"
            >
              <article className="space-y-6 text-gray-300">
                <h2 className="text-3xl font-bold text-white">Create Your Ex Roast Song in 60 Seconds</h2>
                <p className="text-lg leading-relaxed">
                  Breakups are tough, but closure doesn't have to be. <strong>ExRoast.buzz</strong> is the #1 AI breakup song generator that turns your <strong>heartbreak</strong>, <strong>anger</strong>, or <strong>breakup pain</strong> into a savage 60-second diss track. Whether you're dealing with <strong>ex anger</strong>, looking for <strong>breakup closure</strong>, need a <strong>heartbreak anthem</strong>, want a petty revenge song, or just need to <strong>roast your ex</strong> with style, our AI music generator creates personalized roast songs that are TikTok-viral ready. Perfect for anyone going through a <strong>breakup</strong> and needing to express their feelings through music.
                </p>
                
                <h3 className="text-2xl font-bold text-white mt-8">Why Choose ExRoast.buzz for Your Breakup Song, Heartbreak Music, or Ex Roast?</h3>
                <ul className="space-y-3 list-disc list-inside text-lg">
                  <li><strong>AI-Powered Personalization:</strong> Our advanced AI analyzes your breakup story and generates unique lyrics tailored to your situation. No generic templates—every song is personalized.</li>
                  <li><strong>Instant Generation:</strong> Get your ex roast song in seconds. No waiting, no delays. Enter your story and watch the magic happen.</li>
                  <li><strong>TikTok-Viral Ready:</strong> All songs are optimized for social media sharing. Download and share on TikTok, Instagram, WhatsApp, and more.</li>
                  <li><strong>Free Templates Available:</strong> Try our free template library to see how it works. Upgrade to get a fully personalized AI-generated roast song.</li>
                  <li><strong>Multiple Styles:</strong> Choose from savage roasts, petty revenge tracks, healing anthems, and more. Match your vibe perfectly.</li>
                </ul>

                <h3 className="text-2xl font-bold text-white mt-8">How to Create Your Ex Roast Song</h3>
                <ol className="space-y-3 list-decimal list-inside text-lg">
                  <li><strong>Enter Your Story:</strong> Tell us what happened. The more details, the better the roast. Our AI uses your story to create personalized lyrics.</li>
                  <li><strong>Choose Your Style:</strong> Pick between a savage roast or a healing glow-up anthem. Both are equally powerful.</li>
                  <li><strong>Generate Your Song:</strong> Our AI creates a 60-second personalized diss track in seconds.</li>
                  <li><strong>Preview & Share:</strong> Listen to your song, download it, and share it on social media. Watch it go viral!</li>
                </ol>

                <h3 className="text-2xl font-bold text-white mt-8">Perfect for Anyone Going Through a Breakup, Heartbreak, or Ex Anger</h3>
                <p className="text-lg leading-relaxed">
                  Whether you're looking for <strong>breakup closure</strong>, dealing with <strong>heartbreak</strong>, feeling <strong>angry at your ex</strong>, want to create a <strong>viral TikTok roast</strong>, need <strong>breakup healing</strong>, or just need to vent through music, ExRoast.buzz is your go-to <strong>breakup song generator</strong> and <strong>ex roast creator</strong>. Our AI understands the <strong>breakup pain</strong>, the <strong>anger</strong>, the <strong>heartbreak</strong>, and the need for <strong>closure</strong>—and turns it all into a savage, shareable diss track that helps you move on with style. Transform your <strong>breakup anger</strong> into <strong>breakup empowerment</strong> and find <strong>breakup strength</strong> through music.
                </p>
                
                <h3 className="text-2xl font-bold text-white mt-8">Keywords We Cover: Breakup, Ex Roast, Heartbreak, Anger & More</h3>
                <p className="text-lg leading-relaxed">
                  Our AI breakup song generator covers all aspects of <strong>breakups</strong> and <strong>heartbreak</strong>. Whether you're searching for <strong>ex roast songs</strong>, <strong>breakup music</strong>, <strong>heartbreak anthems</strong>, <strong>angry breakup songs</strong>, <strong>breakup revenge tracks</strong>, <strong>ex diss tracks</strong>, <strong>breakup closure music</strong>, <strong>petty revenge songs</strong>, <strong>savage breakup anthems</strong>, or <strong>breakup healing music</strong>—we've got you covered. Create the perfect <strong>ex roast</strong> that matches your <strong>breakup emotions</strong> and helps you find <strong>breakup closure</strong>.
                </p>
              </article>
            </motion.section>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12 text-gray-400 text-lg"
            >
              <p className="font-bold">
                New here? Pick one above • Already have a streak?{" "}
                <Link href="/auth" className="text-exroast-gold hover:text-exroast-pink underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </section>
        </main>
      </div>
      {/* Footer rendered by NavWrapper */}
    </div>
    </>
  );
}
