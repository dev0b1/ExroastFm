import type { Metadata } from "next";
import "./globals.css";
// Paddle removed: no client-side Paddle scripts
import ScrollToTop from "@/components/ScrollToTop";
import GuestCheckoutModal from "@/components/GuestCheckoutModal";
import DodoConfigBanner from "@/components/DodoConfigBanner";
import NavWrapper from "@/components/NavWrapper";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.exroast.buzz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ExRoast.buzz - AI Breakup Roast Songs | Turn Your Ex Into a Savage Diss Track",
    template: "%s | ExRoast.buzz"
  },
  description: "Create a savage 60-second AI roast song about your ex. Turn your breakup, heartbreak, or anger into a TikTok-viral diss track. Generate personalized breakup songs, ex roast music, petty revenge tracks, and breakup closure anthems instantly. Free templates available. Powered by AI.",
  keywords: [
    "ex roast",
    "breakup song",
    "roast my ex",
    "AI music generator",
    "savage roast",
    "petty revenge",
    "breakup revenge",
    "diss track generator",
    "ex roast song",
    "breakup music",
    "roast song generator",
    "AI breakup song",
    "personalized roast",
    "TikTok viral",
    "breakup anthem",
    "ex diss track",
    "savage breakup song",
    "petty breakup music",
    "roast your ex",
    "breakup closure",
    "AI generated music",
    "custom breakup song",
    "ex roast generator",
    "breakup song maker",
    "heartbreak song",
    "angry breakup song",
    "ex revenge song",
    "breakup diss track",
    "roast ex song",
    "breakup closure song",
    "heartbreak music",
    "angry music",
    "breakup anger",
    "ex anger song",
    "heartbreak anthem",
    "breakup healing",
    "moving on song",
    "breakup recovery",
    "ex closure",
    "breakup therapy",
    "roast ex generator",
    "diss your ex",
    "breakup vent song",
    "ex roast music",
    "breakup rap",
    "ex roast rap",
    "breakup hip hop",
    "savage ex song",
    "petty ex song",
    "breakup revenge music",
    "ex revenge track",
    "breakup diss",
    "roast ex track",
    "breakup song AI",
    "AI ex roast",
    "breakup song generator free",
    "free ex roast",
    "breakup song maker free",
    "custom breakup music",
    "personalized breakup song",
    "breakup song creator",
    "ex roast creator",
    "breakup music generator",
    "AI breakup music",
    "breakup song AI generator",
    "ex roast AI",
    "breakup closure music",
    "heartbreak closure",
    "breakup healing music",
    "angry breakup anthem",
    "breakup empowerment",
    "ex roast empowerment",
    "breakup confidence",
    "moving forward song",
    "breakup strength",
    "ex roast strength"
  ],
  authors: [{ name: "ExRoast.buzz" }],
  creator: "ExRoast.buzz",
  publisher: "ExRoast.buzz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ExRoast.buzz",
    title: "ExRoast.buzz - AI Breakup Roast Songs | Turn Your Ex Into a Savage Diss Track",
    description: "Create a savage 60-second AI roast song about your ex. Turn your breakup, heartbreak, or anger into a TikTok-viral diss track. Free templates available. Perfect for breakup closure and moving on.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "ExRoast.buzz - AI Breakup Roast Songs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExRoast.buzz - AI Breakup Roast Songs",
    description: "Turn your breakup into a savage 60-second AI roast song. TikTok-viral diss tracks.",
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@exroastbuzz",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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
        <GoogleAnalytics />
        {/* Dodo SDK is bundled via npm `dodopayments-checkout` - no CDN loader required */}
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
