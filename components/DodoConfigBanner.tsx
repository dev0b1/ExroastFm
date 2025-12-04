"use client";

import React, { useEffect, useState } from "react";

export default function DodoConfigBanner() {
  const [missing, setMissing] = useState<string[] | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/checkout/config');
        if (!res.ok) throw new Error('config check failed');
        const j = await res.json();
        setMissing(j.missing || []);
      } catch (e) {
        setMissing(['failed to check server (network error)']);
      } finally {
        setChecked(true);
      }
    }

    // Only run the check in development to avoid exposing env details in prod
    if (process.env.NODE_ENV !== 'production') check();
  }, []);

  if (!checked || !missing) return null;
  if (missing.length === 0) return null;

  return (
    <div className="fixed left-4 bottom-4 z-50 max-w-xl">
      <div className="bg-yellow-600 text-black px-4 py-3 rounded shadow-lg">
        <strong>Payment config missing:</strong>
        <div className="mt-1 text-sm">
          The server is missing the following Dodo env vars:
          <ul className="list-disc ml-5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
