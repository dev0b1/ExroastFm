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
        (window as any).Paddle.Initialize({
          token: clientToken,
          environment: environment,
        });
        console.log(`Paddle initialized successfully in ${environment} mode`);
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
