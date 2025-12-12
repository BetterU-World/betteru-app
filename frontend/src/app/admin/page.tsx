import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminClient from "./AdminClient";

// 🔐 Define admin emails here - replace with your real admin email(s)
const ADMIN_EMAILS = ["zellsworld11@gmail.com"];

export default async function AdminDashboard() {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user details from Clerk
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  // Debug: Log the email (remove this after confirming it works)
  console.log("User email from Clerk:", userEmail);
  console.log("Admin emails:", ADMIN_EMAILS);

  // Check if user is admin
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-slate-600">
            You do not have permission to access the admin dashboard.
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Fetch metrics from database
  let metrics = {
    totalUsers: 0,
    totalReferrals: 0,
    activeSubscriptions: 0,
    totalCommissionAmount: 0,
    charityAmount: 0,
  };

  try {
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
    />
  );
}
