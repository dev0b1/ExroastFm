import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PaddleLoader } from "@/components/PaddleLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "💔 Breakup Song Generator - Turn Your Heartbreak Into Music",
  description: "Personalized AI breakup songs you can share, laugh, or cry to. Generate custom songs from your breakup story.",
  keywords: ["breakup", "song generator", "AI music", "heartbreak", "emotional healing"],
  openGraph: {
    title: "💔 Breakup Song Generator",
    description: "Turn your breakup into a personalized song",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-gradient-to-br from-heartbreak-50 via-white to-gray-50 min-h-screen">
        <PaddleLoader />
        {children}
      </body>
    </html>
  );
}
