"use client";
import { useEffect, useState } from "react";

type Status = {
  connected: boolean;
  status?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  requirements?: any;
  error?: string;
};

export default function AffiliateConnectPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/stripe-connect/status");
      const json = await res.json();
      setStatus(json);
    } catch (err) {
      setStatus({ connected: false, error: "Status fetch failed" });
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe-connect/start", { method: "POST" });
      const json = await res.json();
      if (json?.url) {
        window.location.href = json.url;
        return;
      }
    } catch (err) {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const connected = !!status?.connected;
  const current = status?.status || "unconnected";

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Stripe Connect</h2>
        <span className={`text-xs px-2 py-1 rounded ${connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
          {connected ? current : "unconnected"}
        </span>
      </div>
      <p className="text-sm text-gray-600">
        Connect your Stripe account to receive payouts.
      </p>
      {!connected && (
        <button
          onClick={startOnboarding}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Starting…" : "Connect Stripe"}
        </button>
      )}
      {connected && (
        <div className="text-xs text-gray-700">
          <div>Charges enabled: {String(status?.charges_enabled)}</div>
          <div>Payouts enabled: {String(status?.payouts_enabled)}</div>
          <div>Details submitted: {String(status?.details_submitted)}</div>
        </div>
      )}
    </div>
  );
}
