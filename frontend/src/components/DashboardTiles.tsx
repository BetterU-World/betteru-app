"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const meta = user.publicMetadata || {};
  // Support either role or isAdmin flag
  if (meta.role === "admin") return true;
  if (meta.isAdmin === true) return true;
  return false;
}

type DashboardTileProps = {
  title: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
};

const DashboardTile: React.FC<DashboardTileProps> = ({ 
  title, 
  description, 
  href, 
  icon, 
  badge, 
  disabled 
}) => {
  const content = (
    <div
      className={`relative flex flex-col gap-2 rounded-2xl border bg-white p-4 md:p-5 shadow-sm transition
                  ${disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-md cursor-pointer"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-xl">{icon}</div>}
          <h3 className="text-base md:text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        {badge && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600">
        {description}
      </p>
      {!disabled && href && (
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
          Open
          <span aria-hidden>↗</span>
        </span>
      )}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default function DashboardTiles() {
  const isAdmin = useIsAdmin();

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <DashboardTile
        title="Diary"
        description="Capture your thoughts, wins, and reflections."
        href="/diary"
        icon={<span>📓</span>}
      />
      <DashboardTile
        title="Goals"
        description="Set goals, track progress, and see deadlines on your calendar."
        href="/goals"
        icon={<span>🎯</span>}
      />
      <DashboardTile
        title="Finances"
        description="Track income, expenses, and your money habits."
        href="/financials"
        icon={<span>💰</span>}
      />
      <DashboardTile
        title="Lists"
        description="Create flexible lists for tasks, shopping, and brain dumps."
        href="/lists"
        icon={<span>📋</span>}
      />
      <DashboardTile
        title="Habits"
        description="Build daily routines, track streaks, and complete habits."
        href="/habits"
        icon={<span>🔄</span>}
      />
      <DashboardTile
        title="Calendar"
        description="See all your diaries, goals, and financial events in one view."
        href="/calendar"
        icon={<span>📅</span>}
      />
      <DashboardTile
        title="Settings"
        description="Manage your profile, preferences, and notifications."
        href="/settings"
        icon={<span>⚙️</span>}
      />
      <DashboardTile
        title="Affiliate"
        description="Share BetterU, see your referrals, earnings, and impact."
        href="/affiliate"
        icon={<span>🤝</span>}
      />

      {/* Admin tile: only render if isAdmin === true */}
      {isAdmin && (
        <DashboardTile
          title="Admin"
          description="Admin-only tools for managing users, payouts, and system settings."
          href="/admin"
          icon={<span>🛠️</span>}
          badge="Admin"
        />
      )}
    </section>
  );
}
