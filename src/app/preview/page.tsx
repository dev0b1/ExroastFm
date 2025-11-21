"use client";

import { Suspense } from "react";
import PreviewContent from "./preview-content";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { LoadingAnimation } from "@/components/LoadingAnimation";

function PreviewLoading() {
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />
      <main className="flex items-center justify-center min-h-[70vh]">
        <LoadingAnimation />
      </main>
      
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />
      <Suspense fallback={<PreviewLoading />}>
        <PreviewContent />
      </Suspense>
    </div>
  );
}
