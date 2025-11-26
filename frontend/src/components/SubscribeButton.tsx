"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error || "Failed to create checkout session");
        alert(data.error || "Something went wrong");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error, check console");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-1">Subscription</h3>
      <p className="text-sm text-slate-600 mb-3">
        Subscribe to unlock full BetterU features (test mode for now).
      </p>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
      >
        {loading ? "Redirecting..." : "Go to Stripe Checkout"}
      </button>
    </div>
  );
}
