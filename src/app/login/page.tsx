"use client";

import { Suspense } from "react";
import LoginContent from "./login-content";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function LoginLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AnimatedBackground />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Header />
      <Suspense fallback={<LoginLoading />}>
        <LoginContent />
      </Suspense>
      <Footer />
    </div>
  );
}
