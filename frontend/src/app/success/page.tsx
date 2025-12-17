import Link from "next/link";
import { headers } from "next/headers";

export default async function SuccessPage() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";
  const hasInvite = cookieHeader.includes("betteru_invite=");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Success — you're in.</h1>
        {!hasInvite && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
            Invite cookie missing (dev).
          </p>
        )}
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-700 dark:text-neutral-200">Welcome to BetterU.</p>
          <div className="mt-4">
            <Link href="/dashboard" className="inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
