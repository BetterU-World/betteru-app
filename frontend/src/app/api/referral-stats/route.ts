import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's referral stats
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        Referral: {
          include: {
            Commission: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        Commission: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Rename for cleaner usage
    const referrals = user.Referral;
    const commissions = user.Commission;

    // Calculate stats
    const totalReferrals = referrals.length;
    const payingReferrals = referrals.filter((r) => r.isPaying).length;
    const totalEarnings = commissions
      .filter((c) => c.status === "approved" || c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);
    const pendingEarnings = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);
    const paidEarnings = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      stats: {
        totalReferrals,
        payingReferrals,
        totalEarnings,
        pendingEarnings,
        paidEarnings,
      },
      referrals,
      commissions,
    });
  } catch (error) {
    console.error("Get referral stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
