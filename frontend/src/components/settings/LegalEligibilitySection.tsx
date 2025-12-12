"use client";

import Link from "next/link";
import { TERMS_VERSION, PRIVACY_VERSION, getPolicyStatus } from "@/lib/policies";

type UserLegal = {
  isAdultConfirmed: boolean;
  adultConfirmedAt: string | null;
  acceptedTermsVersion: string | null;
  acceptedTermsAt: string | null;
  acceptedPrivacyVersion: string | null;
  acceptedPrivacyAt: string | null;
};

export default function LegalEligibilitySection({ user }: { user: UserLegal }) {
  const status = getPolicyStatus(user);
  const next = "/settings";
  const needsUpdate = status.needsOnboarding;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-3">
      <h2 className="font-semibold text-lg">Legal &amp; Eligibility</h2>
      <div className="text-sm text-slate-700 space-y-2">
        <div>
          <span className="font-medium">Age confirmed:</span> {status.isAdultConfirmed ? "Yes" : "No"}
          {user.adultConfirmedAt && (
            <span className="text-slate-500"> (on {new Date(user.adultConfirmedAt).toLocaleDateString()})</span>
          )}
        </div>
        <div>
          <span className="font-medium">Terms:</span> {user.acceptedTermsAt ? "Accepted" : "Not accepted"}
          {user.acceptedTermsVersion && (
            <span className="text-slate-500"> (version {user.acceptedTermsVersion}, {new Date(user.acceptedTermsAt as string).toLocaleDateString()})</span>
          )}
          <span className={`ml-2 text-xs px-2 py-1 rounded ${user.acceptedTermsVersion === TERMS_VERSION ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {user.acceptedTermsVersion === TERMS_VERSION ? "Current" : "Outdated"}
          </span>
        </div>
        <div>
          <span className="font-medium">Privacy:</span> {user.acceptedPrivacyAt ? "Accepted" : "Not accepted"}
          {user.acceptedPrivacyVersion && (
            <span className="text-slate-500"> (version {user.acceptedPrivacyVersion}, {new Date(user.acceptedPrivacyAt as string).toLocaleDateString()})</span>
          )}
          <span className={`ml-2 text-xs px-2 py-1 rounded ${user.acceptedPrivacyVersion === PRIVACY_VERSION ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {user.acceptedPrivacyVersion === PRIVACY_VERSION ? "Current" : "Outdated"}
          </span>
        </div>
      </div>

      {needsUpdate ? (
        <div className="mt-3">
          <Link
            href={`/onboarding?next=${encodeURIComponent(next)}`}
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            Review &amp; Accept Updates
          </Link>
        </div>
      ) : (
        <div className="mt-2">
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Up to date</span>
        </div>
      )}
    </div>
  );
}
