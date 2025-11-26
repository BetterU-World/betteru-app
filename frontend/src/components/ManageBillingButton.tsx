"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/create-portal-session", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not open billing portal");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageBilling}
      disabled={loading}
      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50 text-sm font-medium"
    >
      {loading ? "Opening…" : "Manage Billing"}
    </button>
  );
}
