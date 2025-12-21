"use client";

import { useUser, useClerk } from "@clerk/nextjs";

export default function SettingsAccountClient() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const fullName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {}
  };

  return (
    <div className="space-y-3">
      {user ? (
        <div className="text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Name:</span>
            <span className="font-mono bg-slate-100 px-1 rounded">{fullName || "—"}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium">Primary Email:</span>
            <span className="font-mono bg-slate-100 px-1 rounded">{primaryEmail || "—"}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">You are signed out.</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
        >
          Sign Out
        </button>
        {/* Fallback classic sign-out route */}
        <a
          href="/sign-out"
          className="text-sm text-slate-600 hover:underline"
        >
          or use classic sign-out
        </a>
      </div>
    </div>
  );
}
