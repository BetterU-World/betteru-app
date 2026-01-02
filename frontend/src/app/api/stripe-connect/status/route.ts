export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/requireUser";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireDbUser();

    if (!user.stripeConnectAccountId) {
      return NextResponse.json({
        connected: false,
        status: "unconnected",
      });
    }

    const acct = await getStripe().accounts.retrieve(user.stripeConnectAccountId);

    const chargesEnabled = !!acct.charges_enabled;
    const payoutsEnabled = !!acct.payouts_enabled;
    const detailsSubmitted = !!acct.details_submitted;
    const status = payoutsEnabled && detailsSubmitted ? "complete" : "pending";

    // Persist latest flags for server-side checks
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeConnectChargesEnabled: chargesEnabled,
        stripeConnectPayoutsEnabled: payoutsEnabled,
        stripeConnectDetailsSubmitted: detailsSubmitted,
        stripeConnectStatus: status,
      },
    });

    return NextResponse.json({
      connected: true,
      accountId: acct.id,
      status,
      charges_enabled: chargesEnabled,
      payouts_enabled: payoutsEnabled,
      details_submitted: detailsSubmitted,
      requirements: acct.requirements || null,
    });
  } catch (err: any) {
    console.error("Stripe Connect status error:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
