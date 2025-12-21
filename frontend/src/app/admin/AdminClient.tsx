"use client";

interface AdminClientProps {
  userEmail: string;
  totalUsers: number;
  totalReferrals: number;
  activeSubscriptions: number;
  totalCommissionAmount: number;
  charityAmount: number;
  totalDiaryEntries: number;
  totalGoals: number;
  totalHabits: number;
  totalDailyLogs: number;
  createdLast7Days: {
    diaryEntries: number;
    goals: number;
    habits: number;
    dailyLogs: number;
  };
  createdLast24h: {
    diaryEntries: number;
    goals: number;
    habits: number;
    dailyLogs: number;
  };
  createdLast30d: {
    diaryEntries: number;
    goals: number;
    habits: number;
    dailyLogs: number;
  };
  dailyTrend14: Array<{
    date: string;
    diary: number;
    goals: number;
    habits: number;
    dailyState: number;
  }>;
  systemStatus: {
    dbReachable: boolean;
    authAvailable: boolean;
    nodeEnv: string;
    appUrlSet: boolean;
  };
}

export default function AdminClient({
  userEmail,
  totalUsers,
  totalReferrals,
  activeSubscriptions,
  totalCommissionAmount,
  charityAmount,
  totalDiaryEntries,
  totalGoals,
  totalHabits,
  totalDailyLogs,
  createdLast7Days,
  createdLast24h,
  createdLast30d,
  dailyTrend14,
  systemStatus,
}: AdminClientProps) {
  const conversionRate =
    totalReferrals > 0
      ? ((activeSubscriptions / totalReferrals) * 100).toFixed(1)
      : "0";

  function fmtRelative(date: Date): string {
    const now = Date.now();
    const diffMs = now - new Date(date).getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return `${day}d ago`;
    if (hr > 0) return `${hr}h ago`;
    if (min > 0) return `${min}m ago`;
    return `${sec}s ago`;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            BetterU overview and internal metrics.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as: <span className="font-medium">{userEmail}</span>
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalUsers.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
          </div>

          {/* Total Referrals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Total Referrals
              </h3>
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalReferrals.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">All referral signups</p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Active Subscriptions
              </h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {activeSubscriptions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Paying subscribers</p>
          </div>

          {/* Affiliate Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Affiliate Earnings
              </h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ${(totalCommissionAmount / 100).toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Total commission (pending + paid)
            </p>
          </div>

          {/* Charity Pool */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Charity Pool
              </h3>
              <span className="text-2xl">❤️</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {charityAmount > 0
                ? `$${charityAmount.toFixed(2)}`
                : "$0.00"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              10% of all subscriptions (founder&apos;s charitable donations)
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">
                Conversion Rate
              </h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{conversionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">
              Referrals → Paid subscribers
            </p>
          </div>

          {/* App Data: Diary Entries */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Diary Entries</h3>
              <span className="text-2xl">📓</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalDiaryEntries.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Last 24h: {createdLast24h.diaryEntries.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Last 7d: {createdLast7Days.diaryEntries.toLocaleString()}</p>
          </div>

          {/* App Data: Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Goals</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalGoals.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Last 24h: {createdLast24h.goals.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Last 7d: {createdLast7Days.goals.toLocaleString()}</p>
          </div>

          {/* App Data: Habits */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Habits</h3>
              <span className="text-2xl">🔄</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalHabits.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Last 24h: {createdLast24h.habits.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Last 7d: {createdLast7Days.habits.toLocaleString()}</p>
          </div>

          {/* App Data: Daily Logs (Habit Completions) */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Daily Logs</h3>
              <span className="text-2xl">🗓️</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {totalDailyLogs.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">Last 24h: {createdLast24h.dailyLogs.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Last 7d: {createdLast7Days.dailyLogs.toLocaleString()}</p>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">DB reachable</span>
                <span className={systemStatus.dbReachable ? "text-green-600" : "text-red-600"}>
                  {systemStatus.dbReachable ? "OK" : "Error"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Auth available</span>
                <span className={systemStatus.authAvailable ? "text-green-600" : "text-red-600"}>
                  {systemStatus.authAvailable ? "OK" : "Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">NODE_ENV</span>
                <span className="text-slate-700">{systemStatus.nodeEnv}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">APP URL set</span>
                <span className={systemStatus.appUrlSet ? "text-slate-700" : "text-red-600"}>
                  {systemStatus.appUrlSet ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Trends Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Trends Overview</h2>
            {/* Activity Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm font-medium text-slate-600 mb-2">Diary Entries</div>
                <div className="text-xs text-slate-500">24h</div>
                <div className="text-xl font-semibold">{createdLast24h.diaryEntries}</div>
                <div className="text-xs text-slate-500 mt-2">7d: {createdLast7Days.diaryEntries}</div>
                <div className="text-xs text-slate-500">30d: {createdLast30d.diaryEntries}</div>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm font-medium text-slate-600 mb-2">Goals</div>
                <div className="text-xs text-slate-500">24h</div>
                <div className="text-xl font-semibold">{createdLast24h.goals}</div>
                <div className="text-xs text-slate-500 mt-2">7d: {createdLast7Days.goals}</div>
                <div className="text-xs text-slate-500">30d: {createdLast30d.goals}</div>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm font-medium text-slate-600 mb-2">Habits</div>
                <div className="text-xs text-slate-500">24h</div>
                <div className="text-xl font-semibold">{createdLast24h.habits}</div>
                <div className="text-xs text-slate-500 mt-2">7d: {createdLast7Days.habits}</div>
                <div className="text-xs text-slate-500">30d: {createdLast30d.habits}</div>
              </div>
              <div className="rounded-lg border bg-white p-4">
                <div className="text-sm font-medium text-slate-600 mb-2">Daily State Logs</div>
                <div className="text-xs text-slate-500">24h</div>
                <div className="text-xl font-semibold">{createdLast24h.dailyLogs}</div>
                <div className="text-xs text-slate-500 mt-2">7d: {createdLast7Days.dailyLogs}</div>
                <div className="text-xs text-slate-500">30d: {createdLast30d.dailyLogs}</div>
              </div>
            </div>

            {/* Daily Trend (last 14 days) */}
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-2 pr-4 text-slate-600">Date</th>
                    <th className="py-2 pr-4 text-slate-600">Diary</th>
                    <th className="py-2 pr-4 text-slate-600">Goals</th>
                    <th className="py-2 pr-4 text-slate-600">Habits</th>
                    <th className="py-2 pr-4 text-slate-600">DailyState</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTrend14.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-3 text-slate-500">Trends unavailable</td>
                    </tr>
                  )}
                  {dailyTrend14.map((row) => (
                    <tr key={row.date} className="border-b border-slate-100">
                      <td className="py-2 pr-4 text-slate-700">{row.date}</td>
                      <td className="py-2 pr-4">{row.diary}</td>
                      <td className="py-2 pr-4">{row.goals}</td>
                      <td className="py-2 pr-4">{row.habits}</td>
                      <td className="py-2 pr-4">{row.dailyState}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
            >
              🔄 Refresh Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
