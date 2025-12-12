import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getClerkClient } from "@/lib/clerk";
import { requireUserId } from "@/lib/auth/requireUser";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();

    // Get user from Clerk to read metadata
    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    const stripeCustomerId =
      user.privateMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer found for this user yet. Try subscribing first.",
        },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Portal error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
