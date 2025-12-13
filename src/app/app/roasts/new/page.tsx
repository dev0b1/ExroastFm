"use client";

export const dynamic = 'force-dynamic';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewRoastRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately route to the existing story/creation flow with roast mode
    router.replace('/story?mode=roast');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <div className="max-w-xl text-center p-6">
        <h1 className="text-3xl font-black mb-4">Preparing your Roast…</h1>
        <p className="text-gray-300">Redirecting to the roast creation flow. If you are not redirected automatically, <a className="underline" href="/story?mode=roast">click here</a>.</p>
      </div>
    </div>
  );
}
