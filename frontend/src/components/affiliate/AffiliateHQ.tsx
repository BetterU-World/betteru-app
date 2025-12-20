"use client";

import { useState } from "react";
import { affiliateResources } from "../../content/affiliateResources";

type CopiedMap = Record<string, boolean>;

export default function AffiliateHQ() {
  const [copied, setCopied] = useState<CopiedMap>({});

  const copyText = async (id: string, text: string) => {
    const markCopied = () => {
      setCopied((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [id]: false })), 1800);
    };

    try {
      await navigator.clipboard.writeText(text);
      markCopied();
      return;
    } catch (err) {
      // Fallback for older browsers / mobile
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.left = "-1000px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        markCopied();
      } catch (fallbackErr) {
        console.error("Copy failed", fallbackErr);
      }
    }
  };

  return (
    <section className="border rounded-lg p-4 space-y-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Affiliate HQ</h2>
      <p className="text-sm text-gray-600">
        Text-only resources to share BetterU in a positive, privacy-first way.
        Copy, paste, and personalize. No uploads required.
      </p>

      {/* Quick Copy Bank */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Quick Copy Bank</h3>
        <div className="grid grid-cols-1 gap-3">
          {affiliateResources.quickCopyBank.map((item) => (
            <details key={item.id} className="group border rounded-md bg-slate-50">
              <summary className="flex items-center justify-between cursor-pointer px-3 py-2">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-gray-500">Tap to expand</span>
              </summary>
              <div className="px-3 pb-3 pt-1 space-y-2">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white border rounded p-3">
                  {item.text}
                </pre>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(item.id, item.text)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                  {copied[item.id] && (
                    <span className="text-xs text-green-700">✓ Copied</span>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* BetterU Philosophy */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">BetterU Philosophy</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
          {affiliateResources.philosophy.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

      {/* Sharing Do's & Don’ts */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Sharing Do’s & Don’ts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded-md p-3 bg-slate-50">
            <h4 className="font-medium mb-1">Do’s</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
              {affiliateResources.sharingDos.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="border rounded-md p-3 bg-slate-50">
            <h4 className="font-medium mb-1">Don’ts</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
              {affiliateResources.sharingDonts.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
