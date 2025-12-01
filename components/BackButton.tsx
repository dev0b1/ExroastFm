"use client";
import React from "react";

export default function BackButton({ fallback = '/' }: { fallback?: string }) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = fallback;
        }
      }}
      className="inline-flex items-center px-3 py-2 rounded bg-gray-800 text-white hover:opacity-90 mb-4"
    >
      ← Back
    </button>
  );
}
