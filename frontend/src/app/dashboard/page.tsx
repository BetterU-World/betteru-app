import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";
import { getCurrentBetterUUser } from "@/lib/currentBetterUUser";

export default async function DashboardPage() {
  const user = await getCurrentBetterUUser();

  if (!user) {
    redirect("/sign-in");
  }

  const tiles = [
    {
      href: "/calendar",
      title: "Calendar",
      description: "See and plan your events, routines, and important dates."
    },
    {
      href: "/lists",
      title: "Lists",
      description: "Shopping lists, todos, and reminders all in one place."
    },
    {
      href: "/habits",
      title: "Habits & Goals",
      description: "Track your daily habits and long-term goals."
    },
    {
      href: "/diary",
      title: "Diary",
      description: "Journal your thoughts, wins, and reflections."
    },
    {
      href: "/financials",
      title: "Financials",
      description: "Track income, expenses, and your money habits."
    },
    {
      href: "/affiliate",
      title: "Affiliate",
      description: "See your referrals, earnings, and impact."
    },
    {
      href: "/settings",
      title: "Settings",
      description: "Manage your profile, preferences, and notifications."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BetterU</h1>
          <p className="text-sm text-slate-500">
            Better You, Better World.
            {user.isPro && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">PRO</span>}
          </p>
        </div>
        <UserButton />
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-1">Dashboard</h2>
          <p className="text-sm text-slate-600">
            This is your home base. Tap a section below to start organizing your life.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tiles.map(tile => (
            <Link
              key={tile.href}
              href={tile.href}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-1">{tile.title}</h3>
              <p className="text-sm text-slate-600">{tile.description}</p>
            </Link>
          ))}
        </section>

        {!user.isPro && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-2">Upgrade to BetterU Pro</h3>
            <p className="text-sm text-gray-600 mb-4">
              Unlock unlimited features, advanced analytics, and priority support.
            </p>
            <SubscribeButton />
          </div>
        )}
      </main>
    </div>
  );
}
