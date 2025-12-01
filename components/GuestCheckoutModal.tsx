"use client";
import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    __requestGuestEmail?: () => Promise<string | null>;
    __showCheckoutSpinner?: () => void;
    __hideCheckoutSpinner?: () => void;
  }
}

export default function GuestCheckoutModal() {
  const [isEmailOpen, setEmailOpen] = useState(false);
  const [isSpinnerOpen, setSpinnerOpen] = useState(false);
  const [resolveFn, setResolveFn] = useState<((val: string | null) => void) | null>(null);
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    // Expose functions on window for other scripts to call
    window.__requestGuestEmail = () => {
      return new Promise((resolve) => {
        setResolveFn(() => resolve);
        setEmailInput( (localStorage.getItem('guestEmail')) || "" );
        setEmailOpen(true);
      });
    };

    window.__showCheckoutSpinner = () => setSpinnerOpen(true);
    window.__hideCheckoutSpinner = () => setSpinnerOpen(false);

    return () => {
      try {
        delete window.__requestGuestEmail;
        delete window.__showCheckoutSpinner;
        delete window.__hideCheckoutSpinner;
      } catch (e) {
        // ignore
      }
    };
  }, []);

  function onSubmitEmail(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const email = emailInput?.trim() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // invalid email — keep modal open
      alert("Please enter a valid email address or leave blank to continue as guest.");
      return;
    }
    try {
      if (email) localStorage.setItem('guestEmail', email);
    } catch (e) {
      // ignore storage errors
    }
    setEmailOpen(false);
    if (resolveFn) {
      resolveFn(email);
      setResolveFn(null);
    }
  }

  function onSkip() {
    setEmailOpen(false);
    if (resolveFn) {
      resolveFn(null);
      setResolveFn(null);
    }
  }

  return (
    <>
      {/* Email collection modal */}
      {isEmailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-md max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Enter your email (optional)</h3>
            <p className="text-sm text-gray-600 mb-4">We will send a receipt and a download link to this email.</p>
            <form onSubmit={onSubmitEmail}>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded mb-4"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={onSkip} className="px-4 py-2 rounded bg-gray-200">Continue as guest</button>
                <button type="submit" className="px-4 py-2 rounded bg-exroast-pink text-white">Continue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Non-dismissible spinner while checkout initializes */}
      {isSpinnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center text-white">
            <div className="mb-4 animate-spin">
              <svg className="w-12 h-12 mx-auto" viewBox="0 0 50 50">
                <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M25 5a20 20 0 0 1 0 40 20 20 0 0 1 0-40z"></path>
              </svg>
            </div>
            <div className="text-xl font-bold">Opening secure checkout…</div>
            <div className="text-sm text-gray-300 mt-2">Please do not close this window.</div>
          </div>
        </div>
      )}
    </>
  );
}
