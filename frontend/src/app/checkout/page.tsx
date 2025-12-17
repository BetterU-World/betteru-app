import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";
  const hasInvite = cookieHeader.includes("betteru_invite=");

  if (!hasInvite) {
    redirect("/landing");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-700 dark:text-neutral-200">
            Membership checkout will be here (Stripe Phase 2).
          </p>
          <div className="mt-4">
            <Link href="/success" className="inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
              Simulate Purchase (Dev)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
