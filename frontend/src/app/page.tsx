import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[60vh] items-start justify-center pt-16 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/80 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-slate-900">Invite-only access</h1>
        <p className="mt-3 text-slate-700">
          BetterU is invite-only. If you already have an account, log in below. If you
          received an invite/referral link, open that link to continue.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Log in
          </Link>
          <div className="text-center text-sm text-slate-600">
            <span className="block">I have an invite link</span>
            <span className="mt-1 block">Open the invite link you received.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
