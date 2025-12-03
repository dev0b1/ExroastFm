import { Suspense } from "react";
import AuthContent from "./auth-content";
import { AnimatedBackground } from "@/components/AnimatedBackground";
// Header/Footer provided by NavWrapper in root layout

function AuthLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <AnimatedBackground />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Suspense fallback={<AuthLoading />}>
        <AuthContent />
      </Suspense>
      {/* Footer rendered by NavWrapper */}
    </div>
  );
}
