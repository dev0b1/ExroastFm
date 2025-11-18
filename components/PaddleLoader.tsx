"use client";

import Script from "next/script";

export function PaddleLoader() {
  const handleLoad = () => {
    if (typeof window !== "undefined" && (window as any).Paddle) {
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";

      if (!clientToken) {
        console.warn("Paddle client token not found. Payment functionality will not work.");
        return;
      }

      try {
        // The Paddle CDN script does not accept an `environment` option here.
        // Provide the client token only. Use NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to
        // control sandbox vs production keys (switch tokens in env).
        (window as any).Paddle.Initialize({
          token: clientToken,
        });
        console.log(`Paddle initialized successfully (env hint: ${environment})`);
      } catch (error) {
        console.error("Failed to initialize Paddle:", error);
      }
    }
  };

  const handleError = () => {
    console.error("Failed to load Paddle SDK");
  };

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
