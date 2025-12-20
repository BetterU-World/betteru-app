import Link from "next/link";
import { headers } from "next/headers";

export default async function LandingPage() {
  const h = await headers();
  const cookieHeader = h.get("cookie") || "";
  const hasInvite = cookieHeader.includes("betteru_invite=");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="container mx-auto max-w-3xl px-4 pt-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">BetterU</h1>
        <p className="text-lg text-neutral-700 dark:text-neutral-200">Intentional life management, privacy-first.</p>
        <p className="mt-2 text-neutral-700 dark:text-neutral-200">
          BetterU brings together your diary, goals, habits, and calendars to help you focus on what matters — without compromising your privacy.
        </p>
      </div>

      {/* Invite gate + CTA */}
      <div className="container mx-auto max-w-3xl px-4 mt-6">
        {!hasInvite ? (
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-700 dark:text-neutral-200 font-medium">Invite-only access</p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Use your invite link to proceed and unlock setup.</p>
            <div className="mt-4">
              <Link href="/landing" className="inline-block px-4 py-2 rounded bg-neutral-200 text-neutral-700 cursor-not-allowed">
                Awaiting Invite
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-700 dark:text-neutral-200">Welcome! Your invite is recognized.</p>
            <div className="mt-4">
              <Link href="/checkout" className="inline-block px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                Continue
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Value Props */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold mb-1">Diary</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Reflect daily with entries, media, and quick notes.</p>
          </div>
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold mb-1">Goals & Habits</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Build consistency with milestones and streaks.</p>
          </div>
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold mb-1">Calendar</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Plan intentionally; sync events and system suggestions.</p>
          </div>
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold mb-1">Moments</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Celebrate wins: updates, insights, and milestones.</p>
          </div>
          <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="font-semibold mb-1">Privacy-first</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Minimal tracking, encryption-ready pathways, and user control.</p>
          </div>
        </div>
      </div>

      {/* How It Works (Invite-only) */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">How It Works</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Invite-only to ensure quality and care. Three steps:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-sm font-semibold">1. Invite</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Use your invite link to activate access.</p>
            </div>
            <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-sm font-semibold">2. Account</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Create your profile and set personal preferences.</p>
            </div>
            <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="text-sm font-semibold">3. App</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Start with Diary, set Goals, manage Habits & Calendar.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate + Overflow */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Affiliate & Overflow</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">BetterU is exploring value-aligned affiliate partnerships and overflow programs to responsibly extend access without compromising user trust.</p>
        </div>
      </div>

      {/* Charity note */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Charity</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">We support transparent giving and community benefit. Our aim is to operate responsibly and contribute positively over time.</p>
        </div>
      </div>

      {/* Privacy promise */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">Privacy Promise</h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-200 font-medium">BetterU will never sell data.</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">We’re building optional privacy-first features including no tracking modes, encryption pathways, and offline-friendly experiences where feasible.</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="container mx-auto max-w-5xl px-4 mt-10">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-sm font-medium">What is BetterU?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">A privacy-first personal platform for diary, goals, habits, calendars, and insights.</p>
            </div>
            <div>
              <div className="text-sm font-medium">Is it invite-only?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Yes. We prioritize quality, safety, and intentional growth.</p>
            </div>
            <div>
              <div className="text-sm font-medium">How does privacy work?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">We avoid unnecessary tracking and are building encryption-ready, offline-friendly modes.</p>
            </div>
            <div>
              <div className="text-sm font-medium">What are Moments?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">A curated view of positive updates like streaks and milestones.</p>
            </div>
            <div>
              <div className="text-sm font-medium">Can I use BetterU on mobile?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Yes, BetterU is responsive and designed to work across devices.</p>
            </div>
            <div>
              <div className="text-sm font-medium">Is there an affiliate program?</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">We’re exploring value-aligned partnerships that respect user trust.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="container mx-auto max-w-3xl px-4 mt-10 pb-16">
        <div className="rounded-md border border-neutral-200/70 bg-white px-4 py-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 text-center">
          <h3 className="text-base font-semibold">Ready to begin?</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">Join BetterU and start intentionally shaping your days.</p>
          <div className="mt-4">
            {hasInvite ? (
              <Link href="/checkout" className="inline-block px-5 py-2.5 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                Continue
              </Link>
            ) : (
              <Link href="/landing" className="inline-block px-5 py-2.5 rounded bg-neutral-200 text-neutral-700 cursor-not-allowed">
                Awaiting Invite
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
