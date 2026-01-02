export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/requireUser";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser();

    let acctId = user.stripeConnectAccountId || null;

    if (!acctId) {
      const account = await getStripe().accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
          // card_payments can be requested later if needed
        },
        business_type: "individual",
      });

      acctId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeConnectAccountId: acctId,
          stripeConnectStatus: "pending",
          stripeConnectChargesEnabled: !!account.charges_enabled,
          stripeConnectPayoutsEnabled: !!account.payouts_enabled,
          stripeConnectDetailsSubmitted: !!account.details_submitted,
        },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";
    const link = await getStripe().accountLinks.create({
      account: acctId!,
      refresh_url: `${appUrl}/settings/affiliate?stripe=refresh`,
      return_url: `${appUrl}/settings/affiliate?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err: any) {
    console.error("Stripe Connect start error:", err);
    return NextResponse.json({ error: "Failed to start Stripe Connect" }, { status: 500 });
  }
}
