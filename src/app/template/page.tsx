"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { openTierCheckout } from '@/lib/checkout';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StyleSelector, SongStyle } from "@/components/StyleSelector";
import LoadingProgress, { LoadingStep } from "@/components/LoadingProgress";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { SparkStorm } from "@/components/SparkStorm";
import { ConfettiPop } from "@/components/ConfettiPop";
import { Tooltip } from "@/components/Tooltip";

export default function TemplatePage() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [style, setStyle] = useState<SongStyle>("petty");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('lyrics');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  // daily opt-in removed from template page — handled in Daily tab

  const handleGenerate = async () => {
    if (story.trim().length < 10) {
      alert("Spill more tea! We need at least 10 characters to roast properly 🔥");
      return;
    }

    setIsGenerating(true);
    setLoadingStep('lyrics');
    setLoadingProgress(0);

    try {
      const extractedText = story;

      setLoadingStep('lyrics');
      setLoadingProgress(30);

      // For anonymous/template users we always use the template preview endpoint
      const endpoint = "/api/generate-preview";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          story: extractedText,
          style,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLoadingStep('complete');
        setLoadingProgress(100);

        setShowConfetti(true);

        if (typeof window !== 'undefined') {
          let recentRoasts = [] as any[];
          try {
            const raw = localStorage.getItem('recentRoasts');
            if (raw) recentRoasts = JSON.parse(raw);
            if (!Array.isArray(recentRoasts)) recentRoasts = [];
          } catch (err) {
            console.warn('Invalid recentRoasts in localStorage, resetting it.', err, localStorage.getItem('recentRoasts'));
            recentRoasts = [];
          }

          recentRoasts.unshift({
            id: data.songId,
            title: data.title,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('recentRoasts', JSON.stringify(recentRoasts.slice(0, 3)));
        }

        // daily opt-in moved to Daily tab; creation flows no longer contain the opt-in controls

        setTimeout(() => {
          router.push(`/preview?songId=${data.songId}`);
        }, 1500);
      } else {
        throw new Error(data.error || "Failed to generate preview");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <AnimatedBackground />
        <div className="relative z-10">
          <LoadingProgress currentStep={loadingStep} progress={loadingProgress} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <SparkStorm />
      <ConfettiPop show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-black text-gradient">
                Try a Mock Roast 🔥
              </h1>
              <p className="text-2xl text-white font-bold">
                Generate a free template preview — no sign-in required
              </p>
            </div>

            <div className="card space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="block text-xl font-black text-white">
                  Spill the tea — what did they do? 🔥
                </label>
                <Tooltip content="Be specific for savage lyrics (e.g., 'Ghosted after tacos')">
                  <div className="relative">
                    <textarea
                      value={story}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setStory(e.target.value);
                        }
                        }}
                        maxLength={500}
                        placeholder="They ghosted me after 2 years... They cheated with my best friend... They said I was 'too much'... Give us EVERYTHING 🗡️"
                        className="input-field resize-none"
                        style={{ 
                          width: '100%',
                          minHeight: '240px',
                          fontSize: '16px',
                          opacity: 1.0
                        }}
                      />
                      <div className="absolute bottom-4 right-4 text-sm text-white/70 font-medium">
                        {story.length}/500
                      </div>
                    </div>
                  </Tooltip>
                  <p className="text-sm text-white italic">
                    💡 The more specific, the more savage the roast
                  </p>
                </div>

              {/* Style Selector */}
              <div className="pt-4">
                <Tooltip content="Petty = Brutal diss; Glow-Up = Victory banger">
                  <div>
                    <StyleSelector
                      selected={style}
                      onChange={setStyle}
                    />
                  </div>
                </Tooltip>
              </div>

              {/* Daily Petty Power-Ups removed from template page; details are available in the Daily tab */}

              {/* Generate Button */}
              <div className="flex justify-center">
                <Tooltip content="15s free preview—unlock full for $4.99">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 30px rgba(255, 0, 110, 0.8)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={story.trim().length < 10}
                    className="py-6 rounded-2xl font-black text-2xl transition-all duration-100"
                    style={
                      story.trim().length < 10
                        ? {
                            backgroundColor: '#555',
                            color: '#999',
                            cursor: 'not-allowed',
                            opacity: 0.5,
                            width: '70%',
                            willChange: 'transform'
                          }
                        : {
                            backgroundColor: '#ffd23f',
                            color: '#ffffff',
                            border: '3px solid #ff006e',
                            boxShadow: '0 0 20px rgba(255, 210, 63, 0.6)',
                            width: '70%',
                            willChange: 'transform'
                          }
                    }
                  >
                    Generate Mock Roast 🔥💅
                  </motion.button>
                </Tooltip>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <p className="text-center text-sm text-gray-400">
                  Demo template — this plays the full demo. Upgrade to get a personalized song.
                </p>
                <button
                  onClick={async () => { try { await openTierCheckout('premium'); } catch (e) { console.error('Open checkout failed', e); window.location.href = '/pricing'; } }}
                  className="bg-gradient-to-r from-[#ff006e] to-[#ffd23f] text-black font-bold px-6 py-3 rounded-full focus:outline-none focus:ring-4 focus:ring-exroast-gold/60"
                >
                  Upgrade for a personalized song
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
