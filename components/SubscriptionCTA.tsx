"use client";

import { motion } from "framer-motion";
import { FaCheck, FaStar, FaCrown } from "react-icons/fa";
import { useState } from "react";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: any;
  priceId: string;
}

const tiers: SubscriptionTier[] = [
  {
    id: "standard",
    name: "Standard",
    price: 9,
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_STANDARD || "pri_standard",
    icon: FaStar,
    features: [
      "5 full songs per month",
      "All song styles (Sad, Savage, Healing)",
      "HD audio quality",
      "Social sharing",
      "Download MP3 files",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19,
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM || "pri_premium",
    icon: FaCrown,
    popular: true,
    features: [
      "20 full songs per month",
      "All song styles (Sad, Savage, Healing)",
      "HD audio quality",
      "Social sharing",
      "Download MP3 files",
      "AI breakup advice",
      "No-contact tips & guidance",
      "Priority support",
      "Early access to new features",
    ],
  },
];

export function SubscriptionCTA() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setIsLoading(tier.id);
    
    try {
      if (typeof window === "undefined") {
        throw new Error("Window is not defined");
      }

      if (!(window as any).Paddle) {
        alert("Payment system is still loading. Please wait a moment and try again.");
        setIsLoading(null);
        return;
      }

      if (!tier.priceId) {
        console.error("Paddle price ID not configured. Please set up your Paddle products and environment variables.");
        alert("Payment system not configured. Please contact support.");
        setIsLoading(null);
        return;
      }

      const isPaddleFormat = /^pri_[0-9a-zA-Z]{20,}$/.test(tier.priceId);
      if (!isPaddleFormat) {
        console.warn(`Price ID "${tier.priceId}" doesn't match Paddle format. Expected format: pri_01... (alphanumeric, 20+ chars). Configure real Paddle price IDs in environment variables.`);
        alert("Payment system not fully configured. Please set up real Paddle price IDs.");
        setIsLoading(null);
        return;
      }

      (window as any).Paddle.Checkout.open({
        items: [
          {
            priceId: tier.priceId,
            quantity: 1,
          },
        ],
        settings: {
          successUrl: `${window.location.origin}/success?tier=${tier.id}`,
          theme: "light",
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Unable to open checkout. Please try again or contact support.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleSingleSongPurchase = () => {
    setIsLoading("single");
    
    try {
      if (typeof window === "undefined") {
        throw new Error("Window is not defined");
      }

      if (!(window as any).Paddle) {
        alert("Payment system is still loading. Please wait a moment and try again.");
        setIsLoading(null);
        return;
      }

      const singlePriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_SINGLE;
      
      if (!singlePriceId) {
        console.error("Paddle price ID for single purchase not configured. Please set up your Paddle products.");
        alert("Payment system not configured. Please contact support.");
        setIsLoading(null);
        return;
      }

      const isPaddleFormat = /^pri_[0-9a-zA-Z]{20,}$/.test(singlePriceId);
      if (!isPaddleFormat) {
        console.warn(`Price ID "${singlePriceId}" doesn't match Paddle format. Expected format: pri_01... (alphanumeric, 20+ chars). Configure real Paddle price IDs in environment variables.`);
        alert("Payment system not fully configured. Please set up real Paddle price IDs.");
        setIsLoading(null);
        return;
      }

      (window as any).Paddle.Checkout.open({
        items: [
          {
            priceId: singlePriceId,
            quantity: 1,
          },
        ],
        settings: {
          successUrl: `${window.location.origin}/success?type=single`,
          theme: "light",
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Unable to open checkout. Please try again or contact support.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Unlock Full Songs
        </h2>
        <p className="text-gray-600 text-lg">
          Choose the plan that fits your heartbreak journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isPopular = tier.popular;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative rounded-3xl p-8 ${
                isPopular
                  ? "bg-gradient-to-br from-heartbreak-500 to-heartbreak-600 text-white shadow-2xl border-4 border-heartbreak-400 transform scale-105"
                  : "bg-white border-2 border-gray-200 shadow-lg"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-full ${isPopular ? "bg-white/20" : "bg-heartbreak-100"}`}>
                  <Icon className={`text-2xl ${isPopular ? "text-white" : "text-heartbreak-500"}`} />
                </div>
                <h3 className={`text-2xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className={`text-5xl font-bold ${isPopular ? "text-white" : "text-gray-900"}`}>
                    ${tier.price}
                  </span>
                  <span className={`ml-2 ${isPopular ? "text-white/80" : "text-gray-500"}`}>
                    /{tier.interval}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FaCheck className={`text-lg mt-0.5 flex-shrink-0 ${
                      isPopular ? "text-white" : "text-heartbreak-500"
                    }`} />
                    <span className={isPopular ? "text-white" : "text-gray-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(tier)}
                disabled={isLoading === tier.id}
                className={`w-full py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 ${
                  isPopular
                    ? "bg-white text-heartbreak-600 hover:shadow-xl"
                    : "bg-gradient-to-r from-heartbreak-500 to-heartbreak-600 text-white hover:shadow-xl"
                }`}
              >
                {isLoading === tier.id ? "Loading..." : `Subscribe to ${tier.name}`}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-gray-600 mb-4">Or buy just this one song</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSingleSongPurchase}
          disabled={isLoading === "single"}
          className="btn-secondary"
        >
          {isLoading === "single" ? "Loading..." : "Buy Single Song - $2.99"}
        </motion.button>
      </div>
    </div>
  );
}
