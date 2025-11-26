import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method } = await req.json();

    // Validate inputs
    if (!amount || amount < 2000) {
      return NextResponse.json(
        { error: "Minimum payout is $20" },
        { status: 400 }
      );
    }

    if (!method || !["stripe", "paypal", "bank_transfer"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payout method" },
        { status: 400 }
      );
    }

    // Get user's available balance
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        commissions: {
          where: {
            status: "approved",
            payoutId: null,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const availableBalance = user.commissions.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create payout
    const payout = await prisma.payout.create({
      data: {
        userId: user.id,
        amount,
        currency: "usd",
        status: "pending",
        method,
      },
    });

    // Link commissions to this payout
    const commissionsToLink = user.commissions.filter((c) => {
      return c.amount <= amount;
    });

    let totalLinked = 0;
    for (const commission of commissionsToLink) {
      if (totalLinked + commission.amount <= amount) {
        await prisma.commission.update({
          where: { id: commission.id },
          data: { payoutId: payout.id },
        });
        totalLinked += commission.amount;
      }
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        method: payout.method,
      },
    });
  } catch (error) {
    console.error("Request payout error:", error);
    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 }
    );
  }
}

// Get payout history
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        payouts: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ payouts: user.payouts });
  } catch (error) {
    console.error("Get payouts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
