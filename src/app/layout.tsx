import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
// Paddle removed: no client-side Paddle scripts
import ScrollToTop from "@/components/ScrollToTop";
import GuestCheckoutModal from "@/components/GuestCheckoutModal";
import DodoConfigBanner from "@/components/DodoConfigBanner";
import NavWrapper from "@/components/NavWrapper";

export const metadata: Metadata = {
  title: "🔥 ExRoast.buzz - Turn Your Breakup Into a Savage Roast Song",
  description: "Zero sadness. 100% savage. Turn your breakup into a TikTok-viral AI roast song in seconds. Petty, brutal, hilarious.",
  keywords: ["breakup song", "roast my ex", "AI music", "savage roast", "petty revenge", "TikTok viral", "breakup revenge"],
  openGraph: {
    title: "🔥 ExRoast.buzz - Roast Your Ex With AI Music",
    description: "Zero sadness. 100% savage. TikTok-viral AI roasts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black min-h-screen font-sans">
        {/*
          Dodo SDK loader: if you set `NEXT_PUBLIC_DODO_SDK_URL` to a CDN
          URL for the Dodo payments SDK, this will dynamically inject the
          script after the page is interactive. This avoids bundling the
          SDK while still allowing the overlay to work in browsers.
        */}
        {process.env.NEXT_PUBLIC_DODO_SDK_URL && (
          <Script id="dodo-sdk-loader" strategy="afterInteractive">
            {`(function(){if(!window.DodoPayments){var s=document.createElement('script');s.src="${process.env.NEXT_PUBLIC_DODO_SDK_URL}";s.async=true;document.head.appendChild(s);}})();`}
          </Script>
        )}
        <ScrollToTop />
        <GuestCheckoutModal />
        <DodoConfigBanner />
        
        <NavWrapper>
          {children}
        </NavWrapper>
      </body>
    </html>
  );
}
