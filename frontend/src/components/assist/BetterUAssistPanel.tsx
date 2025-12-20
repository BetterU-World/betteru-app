"use client";

import { useState } from "react";

export default function BetterUAssistPanel() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"reflect" | "suggest">("reflect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("");

  const sendRequest = async (selectedMode: "reflect" | "suggest") => {
    if (!prompt.trim()) {
      setError("Please enter a brief prompt.");
      return;
    }
    setError(null);
    setLoading(true);
    setResponseText("");
    setMode(selectedMode);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: selectedMode, prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setResponseText(
          data.text ||
            "Coming soon — Assist will help you reflect and choose your next intentional step."
        );
      }
    } catch (e) {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">BetterU Assist</h2>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Ask for reflection or suggestions based on your entry.
      </p>
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Help me reflect on my mood today..."
          rows={4}
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={loading}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sendRequest("reflect")}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading && mode === "reflect" ? "Reflecting..." : "Reflect"}
          </button>
          <button
            type="button"
            onClick={() => sendRequest("suggest")}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 text-slate-900 rounded-md hover:bg-slate-200 border border-slate-200 transition disabled:opacity-50"
          >
            {loading && mode === "suggest" ? "Suggesting..." : "Suggest"}
          </button>
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {responseText && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-800 whitespace-pre-wrap">
            {responseText}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Positive, non-judgmental guidance. No external services used.
      </p>
    </div>
  );
}
