import type { Metadata } from "next";
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
