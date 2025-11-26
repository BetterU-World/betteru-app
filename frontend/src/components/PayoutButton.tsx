"use client";

import { useState } from "react";

interface PayoutButtonProps {
  availableBalance: number;
}

export default function PayoutButton({ availableBalance }: PayoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState("stripe");

  const handleRequestPayout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: availableBalance,
          method,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✓ Payout requested successfully!");
        setShowModal(false);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage(`Error: ${data.error || "Failed to request payout"}`);
      }
    } catch (error) {
      setMessage("Error: Failed to request payout");
    } finally {
      setLoading(false);
    }
  };

  const minPayout = 2000; // $20 minimum
  const canRequestPayout = availableBalance >= minPayout;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canRequestPayout}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Request Payout
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Request Payout</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(availableBalance / 100).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payout Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="stripe">Stripe (Fastest)</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.startsWith("✓")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleRequestPayout}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  {loading ? "Processing..." : "Confirm Payout"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Minimum payout: $20.00 • Processing time: 3-5 business days
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
