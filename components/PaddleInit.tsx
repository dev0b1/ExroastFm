"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    __paddleReady?: boolean;
  }
}

export default function PaddleInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // If Paddle already loaded, mark ready and attempt Setup
    if (window.Paddle) {
      try {
        if (!window.__paddleReady) {
          const vendorId = Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID) || undefined;
          if (vendorId && typeof (window as any).Paddle?.Setup === 'function') {
            try { (window.Paddle as any).Setup({ vendor: vendorId } as any); } catch (e) { console.debug('Paddle.Setup failed', e); }
          }
          window.__paddleReady = true;
        }
      } catch (e) {
        console.debug('Paddle init (already loaded) error', e);
      }
      return;
    }

    // Inject Paddle script early to warm the SDK and reduce checkout latency
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/paddle.js";
    script.async = true;
    script.onload = () => {
      try {
        const vendorId = Number(process.env.NEXT_PUBLIC_PADDLE_VENDOR_ID) || undefined;
        if (vendorId && (window as any).Paddle?.Setup) {
          try { (window as any).Paddle.Setup({ vendor: vendorId } as any); } catch (err) { console.debug('Paddle.Setup error', err); }
        }
      } catch (err) {
        console.debug('Paddle onload handling error', err);
      }
      window.__paddleReady = true;
    };
    script.onerror = (e) => {
      console.error('Failed to load Paddle script', e);
    };
    document.head.appendChild(script);

    return () => {
      // keep script loaded; no cleanup to preserve warm state
    };
  }, []);

  return null;
}
