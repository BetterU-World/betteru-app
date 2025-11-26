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
        referrals: {
          include: {
            commissions: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        commissions: {
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

    // Calculate stats
    const totalReferrals = user.referrals.length;
    const payingReferrals = user.referrals.filter((r) => r.isPaying).length;
    const totalEarnings = user.commissions
      .filter((c) => c.status === "approved" || c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);
    const pendingEarnings = user.commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);
    const paidEarnings = user.commissions
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
      referrals: user.referrals,
      commissions: user.commissions,
    });
  } catch (error) {
    console.error("Get referral stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
