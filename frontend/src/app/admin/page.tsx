import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminClient from "./AdminClient";
import { isAdminEmail } from "@/lib/isAdmin";

export default async function AdminDashboard() {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user details from Clerk
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  // Check if user is admin
  if (!isAdminEmail(userEmail)) {
    redirect("/dashboard");
  }

  // Fetch metrics from database
  let metrics = {
    totalUsers: 0,
    totalReferrals: 0,
    activeSubscriptions: 0,
    totalCommissionAmount: 0,
    charityAmount: 0,
    // App data metrics
    totalDiaryEntries: 0,
    totalGoals: 0,
    totalHabits: 0,
    totalDailyLogs: 0, // HabitCompletion entries (daily logs)
    createdLast7Days: {
      diaryEntries: 0,
      goals: 0,
      habits: 0,
      dailyLogs: 0,
    },
    createdLast24h: {
      diaryEntries: 0,
      goals: 0,
      habits: 0,
      dailyLogs: 0,
    },
    createdLast30d: {
      diaryEntries: 0,
      goals: 0,
      habits: 0,
      dailyLogs: 0,
    },
  };

  let systemStatus = {
    dbReachable: false,
    authAvailable: !!userEmail,
    nodeEnv: process.env.NODE_ENV || "development",
    appUrlSet: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  let dailyTrend14: Array<{
    date: string;
    diary: number;
    goals: number;
    habits: number;
    dailyState: number;
  }> = [];

  try {
    const since7d = new Date();
    since7d.setDate(since7d.getDate() - 7);
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since30d = new Date();
    since30d.setDate(since30d.getDate() - 30);

    // Total user count
    metrics.totalUsers = await prisma.user.count();

    // Total referrals
    metrics.totalReferrals = await prisma.referral.count();

    // Active subscriptions (isPaying = true)
    metrics.activeSubscriptions = await prisma.referral.count({
      where: { isPaying: true },
    });

    // Total commission amount (sum of all commissions)
    const commissionSum = await prisma.commission.aggregate({
      _sum: {
        amount: true,
      },
    });
    metrics.totalCommissionAmount = commissionSum._sum.amount || 0;

    // Total charity allocation amount (sum of all charity allocations)
    const charitySum = await prisma.charityAllocation.aggregate({
      _sum: {
        amount: true,
      },
    });
    metrics.charityAmount = charitySum._sum.amount || 0;

    // App data counts
    metrics.totalDiaryEntries = await prisma.diaryEntry.count();
    metrics.totalGoals = await prisma.goal.count();
    metrics.totalHabits = await prisma.habit.count();
    metrics.totalDailyLogs = await prisma.habitCompletion.count();

    // Created in last 7 days
    metrics.createdLast7Days.diaryEntries = await prisma.diaryEntry.count({
      where: { createdAt: { gte: since7d } },
    });
    metrics.createdLast7Days.goals = await prisma.goal.count({
      where: { createdAt: { gte: since7d } },
    });
    metrics.createdLast7Days.habits = await prisma.habit.count({
      where: { createdAt: { gte: since7d } },
    });
    metrics.createdLast7Days.dailyLogs = await prisma.habitCompletion.count({
      where: { date: { gte: since7d } },
    });

    // Created in last 24 hours
    metrics.createdLast24h.diaryEntries = await prisma.diaryEntry.count({
      where: { createdAt: { gte: since24h } },
    });
    metrics.createdLast24h.goals = await prisma.goal.count({
      where: { createdAt: { gte: since24h } },
    });
    metrics.createdLast24h.habits = await prisma.habit.count({
      where: { createdAt: { gte: since24h } },
    });
    metrics.createdLast24h.dailyLogs = await prisma.habitCompletion.count({
      where: { date: { gte: since24h } },
    });

    // Created in last 30 days
    metrics.createdLast30d.diaryEntries = await prisma.diaryEntry.count({
      where: { createdAt: { gte: since30d } },
    });
    metrics.createdLast30d.goals = await prisma.goal.count({
      where: { createdAt: { gte: since30d } },
    });
    metrics.createdLast30d.habits = await prisma.habit.count({
      where: { createdAt: { gte: since30d } },
    });
    metrics.createdLast30d.dailyLogs = await prisma.habitCompletion.count({
      where: { date: { gte: since30d } },
    });

    // Daily trend for last 14 days (server-side aggregation via raw SQL DATE bucket)
    const diaryDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
      FROM "DiaryEntry"
      WHERE "createdAt" >= (CURRENT_DATE - INTERVAL '13 days')
      GROUP BY day
      ORDER BY day ASC
    `;
    const goalDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
      FROM "Goal"
      WHERE "createdAt" >= (CURRENT_DATE - INTERVAL '13 days')
      GROUP BY day
      ORDER BY day ASC
    `;
    const habitDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
      FROM "Habit"
      WHERE "createdAt" >= (CURRENT_DATE - INTERVAL '13 days')
      GROUP BY day
      ORDER BY day ASC
    `;
    const dailyStateDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT DATE("createdAt") AS day, COUNT(*)::int AS count
      FROM "HabitCompletion"
      WHERE "createdAt" >= (CURRENT_DATE - INTERVAL '13 days')
      GROUP BY day
      ORDER BY day ASC
    `;

    // Build a 14-day sequence and fill counts
    const days: string[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().slice(0, 10);
    });
    const toMap = (rows: Array<{ day: Date; count: number }>) => {
      const m: Record<string, number> = {};
      for (const r of rows) {
        const key = new Date(r.day).toISOString().slice(0, 10);
        m[key] = r.count ?? 0;
      }
      return m;
    };
    const diaryMap = toMap(diaryDaily);
    const goalMap = toMap(goalDaily);
    const habitMap = toMap(habitDaily);
    const dailyStateMap = toMap(dailyStateDaily);
    dailyTrend14 = days.map((date) => ({
      date,
      diary: diaryMap[date] ?? 0,
      goals: goalMap[date] ?? 0,
      habits: habitMap[date] ?? 0,
      dailyState: dailyStateMap[date] ?? 0,
    }));

    // System status checks (graceful)
    try {
      await prisma.user.count();
      systemStatus.dbReachable = true;
    } catch {
      systemStatus.dbReachable = false;
    }
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    // Continue with default values if there's an error
  }

  return (
    <AdminClient
      userEmail={userEmail}
      totalUsers={metrics.totalUsers}
      totalReferrals={metrics.totalReferrals}
      activeSubscriptions={metrics.activeSubscriptions}
      totalCommissionAmount={metrics.totalCommissionAmount}
      charityAmount={metrics.charityAmount}
      totalDiaryEntries={metrics.totalDiaryEntries}
      totalGoals={metrics.totalGoals}
      totalHabits={metrics.totalHabits}
      totalDailyLogs={metrics.totalDailyLogs}
      createdLast7Days={metrics.createdLast7Days}
      createdLast24h={metrics.createdLast24h}
      createdLast30d={metrics.createdLast30d}
      dailyTrend14={dailyTrend14}
      systemStatus={systemStatus}
    />
  );
}
