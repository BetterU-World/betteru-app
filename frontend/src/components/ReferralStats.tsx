"use client";

import { useEffect, useState } from "react";
import PayoutButton from "./PayoutButton";

interface ReferralStatsData {
  stats: {
    totalReferrals: number;
    payingReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  };
  referrals: Array<{
    id: string;
    referredEmail: string;
    isPaying: boolean;
    createdAt: string;
  }>;
  commissions: Array<{
    id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ReferralStats() {
  const [data, setData] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/referral-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load stats");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600 mb-2">{error}</p>
        <p className="text-xs text-gray-500">
          Database not set up yet? Run: <code className="bg-gray-200 px-1">npx prisma migrate dev</code>
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, referrals, commissions } = data;

  const availableBalance = stats.totalEarnings - stats.paidEarnings;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Total Referrals</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalReferrals}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 font-medium mb-1">Paying Referrals</p>
          <p className="text-2xl font-bold text-green-900">{stats.payingReferrals}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 font-medium mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-purple-900">
            ${(stats.totalEarnings / 100).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            ${(stats.pendingEarnings / 100).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">Paid Out</p>
          <p className="text-2xl font-bold text-emerald-900">
            ${(stats.paidEarnings / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payout Section */}
      {availableBalance > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 mb-1">
                Available to Withdraw
              </p>
              <p className="text-3xl font-bold text-green-600">
                ${(availableBalance / 100).toFixed(2)}
              </p>
            </div>
            <PayoutButton availableBalance={availableBalance} />
          </div>
        </div>
      )}

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Recent Referrals</h3>
          <div className="space-y-2">
            {referrals.slice(0, 5).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="text-sm font-medium">{ref.referredEmail}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${ref.isPaying ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {ref.isPaying ? "Paying" : "Free"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Commissions */}
      {commissions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Recent Commissions</h3>
          <div className="space-y-2">
            {commissions.slice(0, 5).map((comm) => (
              <div key={comm.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="text-sm font-medium">${(comm.amount / 100).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {comm.type} • {new Date(comm.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  comm.status === 'paid' ? 'bg-green-100 text-green-800' :
                  comm.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {comm.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No referrals yet. Share your link to get started!</p>
        </div>
      )}
    </div>
  );
}
