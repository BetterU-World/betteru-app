"use client";

interface AdminClientProps {
  userEmail: string;
  totalUsers: number;
  totalReferrals: number;
  activeSubscriptions: number;
  totalCommissionAmount: number;
  charityAmount: number;
}

export default function AdminClient({
  userEmail,
  totalUsers,
  totalReferrals,
  activeSubscriptions,
  totalCommissionAmount,
  charityAmount,
}: AdminClientProps) {
  const conversionRate =
    totalReferrals > 0
      ? ((activeSubscriptions / totalReferrals) * 100).toFixed(1)
      : "0";

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
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
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
