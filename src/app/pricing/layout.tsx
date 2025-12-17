import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Ex Roast Songs | Affordable AI Breakup Music",
  description: "Affordable pricing for personalized AI ex roast songs. Free templates available. One-time purchase $9.99 for custom AI-generated breakup diss tracks.",
  keywords: ["ex roast pricing", "breakup song price", "AI music pricing", "roast song cost", "breakup song generator price"],
  openGraph: {
    title: "Pricing - ExRoast.buzz",
    description: "Affordable pricing for personalized AI ex roast songs. Free templates available.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

