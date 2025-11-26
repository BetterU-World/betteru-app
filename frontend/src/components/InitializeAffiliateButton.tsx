"use client";

import { useState } from "react";

export default function InitializeAffiliateButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInitialize = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/set-affiliate-code", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✓ Affiliate code set: ${data.affiliateCode}`);
        // Reload page to show the new code
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(`Error: ${data.error || "Failed to set code"}`);
      }
    } catch (error) {
      setMessage("Error: Failed to initialize affiliate code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? "Initializing..." : "Initialize Affiliate Code"}
      </button>
      {message && (
        <p className={`text-sm ${message.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
