"use client";
import { useState } from "react";

interface CheckoutButtonProps {
  productId: string;
  customerEmail?: string;
  quantity?: number;
}

export function CheckoutButton({ 
  productId, 
  customerEmail,
  quantity = 1 
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerEmail,
          quantity,
          metadata: {
            orderId: `order-${Date.now()}`,
          }
        }),
      });

      if (!res.ok) {
        throw new Error('Checkout failed');
      }

      const data = await res.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  }

  return (
    <div>
      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Redirecting to checkout..." : "Buy Now"}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
