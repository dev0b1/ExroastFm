import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Ex Roast Song | Try AI Breakup Song Generator",
  description: "Try our free ex roast song generator. Create a 60-second AI breakup roast song instantly. No signup required. Generate personalized diss tracks and breakup anthems.",
  keywords: ["free ex roast", "breakup song generator free", "roast my ex free", "AI breakup song free", "ex roast generator", "breakup song maker"],
  openGraph: {
    title: "Create Free Ex Roast Song | ExRoast.buzz",
    description: "Try our free AI breakup song generator. Create personalized ex roast songs in seconds.",
  },
};

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

