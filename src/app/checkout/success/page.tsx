"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Payment Successful! 🎉
      </h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been confirmed.
      </p>
      {paymentId && (
        <p className="text-sm text-gray-500">
          Payment ID: {paymentId}
        </p>
      )}
      <a 
        href="/"
        className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Return Home
      </a>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
