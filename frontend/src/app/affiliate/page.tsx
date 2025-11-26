import { getCurrentBetterUUser } from "@/lib/currentBetterUUser";
import Header from "@/components/Header";
import InitializeAffiliateButton from "@/components/InitializeAffiliateButton";
import CopyButton from "@/components/CopyButton";
import ReferralStats from "@/components/ReferralStats";

export default async function AffiliatePage() {
  const user = await getCurrentBetterUUser();

  if (!user) {
    return <div className="p-6">Please sign in to view this page.</div>;
  }

  const hasCode = !!user.affiliateCode;
  const displayCode = user.affiliateCode ?? `betteru-${user.id.slice(0, 6)}`;

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const affiliateLink = `${origin}/sign-up?ref=${displayCode}`;
  const referredBy = user.referredBy;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Affiliate Dashboard</h1>

        {!hasCode && (
          <div className="border border-yellow-300 rounded-lg p-4 space-y-3 bg-yellow-50">
            <h2 className="font-semibold text-lg text-yellow-900">Setup Required</h2>
            <p className="text-sm text-yellow-800">
              You need to initialize your affiliate code first. Click below to generate your unique code.
            </p>
            <InitializeAffiliateButton />
          </div>
        )}

        <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
          <h2 className="font-semibold text-lg">Your Affiliate Link</h2>
          <p className="text-sm text-gray-600">
            Share this link. Anyone who signs up with it will be tagged as
            your referral.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-2 items-start">
              <code className="text-xs break-all bg-gray-100 p-2 rounded flex-1">
                {affiliateLink}
              </code>
              <CopyButton text={affiliateLink} />
            </div>
            {!hasCode && (
              <p className="text-xs text-yellow-600">
                ⚠️ Initialize your code above to activate this link
              </p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Your Stats</h2>
            <span className={`text-xs px-2 py-1 rounded ${hasCode ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              {hasCode ? affiliateCode : displayCode + " (not initialized)"}
            </span>
          </div>
          
          <ReferralStats />

          {referredBy && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                You were referred by:{" "}
                <span className="font-mono bg-gray-100 px-1 rounded">
                  {String(referredBy)}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
