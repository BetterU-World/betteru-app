import { currentUser } from "@clerk/nextjs/server";
import Header from "@/components/Header";
import InitializeAffiliateButton from "@/components/InitializeAffiliateButton";
import CopyButton from "@/components/CopyButton";

export default async function AffiliatePage() {
  const user = await currentUser();

  if (!user) {
    return <div className="p-6">Please sign in to view this page.</div>;
  }

  const affiliateCode = user.publicMetadata.affiliateCode as string | undefined;
  const hasCode = !!affiliateCode;

  const displayCode = affiliateCode ?? `betteru-${user.id.slice(0, 6)}`;

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const affiliateLink = `${origin}/sign-up?ref=${displayCode}`;

  // For now we don't have DB to count referrals.
  // We'll show the raw metadata field as an example.
  const referredBy = user.unsafeMetadata?.referredBy;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-8 space-y-6">
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
          <h2 className="font-semibold text-lg">Referral Summary</h2>
          <p className="text-sm text-gray-600">
            Real stats will come once we hook this to a database.
            For now this is your internal debug view.
          </p>

          <ul className="text-sm list-disc ml-5 space-y-1">
            <li>
              Your affiliate code:{" "}
              <span className={`font-mono px-1 rounded ${hasCode ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {hasCode ? affiliateCode : displayCode + " (not initialized)"}
              </span>
            </li>
            <li>
              You were referred by:{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                {referredBy ? String(referredBy) : "No one (origin user)"}
              </span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4 space-y-2 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900">Coming Soon</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Total referred signups count</li>
            <li>• Total paying referrals</li>
            <li>• Commission balance & earnings</li>
            <li>• Payout history & management</li>
            <li>• Referral analytics & charts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
