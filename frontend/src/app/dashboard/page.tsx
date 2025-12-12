import { redirect } from "next/navigation";
import SubscribeButton from "@/components/SubscribeButton";
import DashboardTiles from "@/components/DashboardTiles";
import GoalsSummary from "@/components/GoalsSummary";
import { getCurrentBetterUUser } from "@/lib/currentBetterUUser";

export default async function DashboardPage() {
  const user = await getCurrentBetterUUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Welcome back
            {user.isPro && (
              <span className="ml-3 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 text-sm font-medium text-emerald-700 border border-emerald-200">
                ✨ PRO
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600">
            Choose a tool to start working on your life systems.
          </p>
        </div>
      </header>

      {/* Goals Summary Widget */}
      <section className="mb-6">
        <GoalsSummary />
      </section>

        {/* Dashboard Tiles */}
        <DashboardTiles />

      {/* Upgrade Card - Only shown if not Pro */}
      {!user.isPro && (
        <section className="mt-8">
          <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 via-white to-emerald-50 p-5 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Upgrade to BetterU Pro
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Unlock unlimited features, advanced analytics, priority support, and more.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              <li>• Full access to diary, goals, finances, lists, and calendar systems</li>
              <li>• Advanced insights and upcoming premium features</li>
              <li>• Help fund our 10% charity commitment</li>
            </ul>
            <div className="mt-4">
              <SubscribeButton />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
