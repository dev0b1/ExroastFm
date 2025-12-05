"use client";

import React from "react";
import { openDodoExpressCheckout } from '@/lib/checkout';

type Props = {
  amount: number;
  currency?: string;
  onSuccess?: (res: any) => void;
  className?: string;
};

export default function DodoExpressCheckout({ amount, currency = 'USD', onSuccess, className }: Props) {
  const handleExpress = async () => {
    try {
      const res = await openDodoExpressCheckout({ amount, currency });
      if (onSuccess) onSuccess(res);
    } catch (e) {
      console.error('[DodoExpressCheckout] express checkout failed', e);
      alert('Payment failed. Please try the regular checkout.');
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleExpress}
        className="btn-primary w-full mb-2"
        aria-label="Pay with Google Pay or Apple Pay"
      >
        Pay with Google/Apple Pay
      </button>
    </div>
  );
}
