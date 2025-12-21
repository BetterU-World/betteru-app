import { redirect } from "next/navigation";
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

      {/* Upgrade CTA removed per request; spacing remains clean with tiles above */}
    </div>
  );
}
