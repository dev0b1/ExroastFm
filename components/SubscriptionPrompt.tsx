"use client";

import React from "react";
import { openPrimaryCheckout, openTierCheckout } from "../lib/checkout";
import { PREMIUM_PRICE_ID } from "../lib/pricing";

type Props = {
  onClose: () => void;
};

export default function SubscriptionPrompt({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-lg font-semibold">Unlock Pro</h3>
        <p className="mb-4 text-sm text-gray-600">Welcome — get Pro to remove limits and get the full experience.</p>

        <div className="space-y-3">
          <button
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            onClick={() => {
              openPrimaryCheckout();
              onClose();
            }}
          >
            One-time Pro — $4.99
          </button>

          <button
            className="w-full rounded border border-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-50"
            onClick={() => {
              openTierCheckout('premium', PREMIUM_PRICE_ID);
              onClose();
            }}
          >
            Pro Subscription — monthly
          </button>

          <button className="mt-2 w-full text-sm text-gray-500" onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
