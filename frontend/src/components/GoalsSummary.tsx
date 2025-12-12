"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GoalMilestone {
  id: string;
  title: string;
  dueDate: string | null;
  goal: {
    id: string;
    title: string;
    category: string;
  };
}

interface GoalsSummaryData {
  countActiveGoals: number;
  countCompletedGoals: number;
  nextUpcomingMilestone: GoalMilestone | null;
  topPriorityGoals: Array<{
    id: string;
    title: string;
    category: string;
    targetDate: string;
    priority: string;
  }>;
}

export default function GoalsSummary() {
  const [summary, setSummary] = useState<GoalsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/goals/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching goals summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          🎯 Goals Overview
        </h2>
        <Link
          href="/goals"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/70 rounded-lg p-3">
          <div className="text-sm text-slate-600">Active Goals</div>
          <div className="text-2xl font-bold text-blue-600">
            {summary.countActiveGoals}
          </div>
        </div>
        <div className="bg-white/70 rounded-lg p-3">
          <div className="text-sm text-slate-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {summary.countCompletedGoals}
          </div>
        </div>
      </div>

      {summary.nextUpcomingMilestone && (
        <div className="bg-white/70 rounded-lg p-3 mb-3">
          <div className="text-xs font-medium text-slate-500 mb-1">
            NEXT MILESTONE
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {summary.nextUpcomingMilestone.goal.title}
          </div>
          <div className="text-sm text-slate-600">
            {summary.nextUpcomingMilestone.title}
          </div>
          {summary.nextUpcomingMilestone.dueDate && (
            <div className="text-xs text-slate-500 mt-1">
              📅 Due {formatDate(summary.nextUpcomingMilestone.dueDate)}
            </div>
          )}
        </div>
      )}

      {summary.topPriorityGoals.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3">
          <div className="text-xs font-medium text-slate-500 mb-2">
            TOP PRIORITY GOALS
          </div>
          <div className="space-y-2">
            {summary.topPriorityGoals.map((goal) => (
              <div key={goal.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {goal.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {goal.category} • Due {formatDate(goal.targetDate)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    goal.priority === "HIGH"
                      ? "bg-red-100 text-red-700"
                      : goal.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {goal.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
