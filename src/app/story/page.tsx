"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StyleSelector, SongStyle } from "@/components/StyleSelector";
import LoadingProgress, { LoadingStep } from "@/components/LoadingProgress";
import { FiEdit } from "react-icons/fi";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { SparkStorm } from "@/components/SparkStorm";
import { ConfettiPop } from "@/components/ConfettiPop";
import { Tooltip } from "@/components/Tooltip";

export default function StoryPage() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [style, setStyle] = useState<SongStyle>("petty");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('lyrics');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [proStatusChecked, setProStatusChecked] = useState(false);

  useEffect(() => {
    checkUserProStatus();
  }, []);

  const checkUserProStatus = async () => {
    try {
      const response = await fetch('/api/user/pro-status');
      if (response.ok) {
        const data = await response.json();
        setIsPro(data.isPro || false);
      }
    } catch (error) {
      console.log('Pro status check failed:', error);
    } finally {
      setProStatusChecked(true);
    }
  };

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

      const endpoint = isPro ? "/api/generate-song" : "/api/generate-preview";
      
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
        
        if (!isPro && typeof window !== 'undefined') {
          const recentRoasts = JSON.parse(localStorage.getItem('recentRoasts') || '[]');
          recentRoasts.unshift({
            id: data.songId,
            title: data.title,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('recentRoasts', JSON.stringify(recentRoasts.slice(0, 3)));
        }
        
        setTimeout(() => {
          router.push(`/preview?songId=${data.songId}`);
        }, 1500);
      } else {
        throw new Error(data.error || "Failed to generate song");
      }
    } catch (error) {
      console.error("Error generating song:", error);
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
                Spill the Tea 🔥
              </h1>
              <p className="text-2xl text-white font-bold">
                What did they do? We need ALL the details 🔥
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
                    Generate My Roast 🔥💅
                  </motion.button>
                </Tooltip>
              </div>

              <p className="text-center text-sm text-gray-400">
                Free 15-second preview • Full roast $4.99 • Takes 30 seconds
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
