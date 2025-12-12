"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OnboardingPage() {
  const [isAdult, setIsAdult] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [isAdult, acceptTerms, acceptPrivacy]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/policies/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdultConfirmed: isAdult, acceptTerms, acceptPrivacy }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Submission failed");
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/dashboard";
      window.location.href = next;
    } catch (e) {
      setError("Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const canContinue = isAdult && acceptTerms && acceptPrivacy && !loading;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Legal Onboarding</h1>
      <p className="text-gray-700 mb-4">BetterU is 18+ only. Please confirm your age and accept our policies to continue.</p>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} />
          <span>I confirm I am 18 years or older</span>
        </label>
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          <span>
            I agree to the <Link className="text-indigo-600 underline" href="/terms">Terms of Service</Link>
          </span>
        </label>
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
          <span>
            I agree to the <Link className="text-indigo-600 underline" href="/privacy">Privacy Policy</Link>
          </span>
        </label>

        <button
          onClick={submit}
          disabled={!canContinue}
          className={`px-4 py-2 rounded-md text-white ${canContinue ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400"}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
