import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Clerk to read metadata
    const user = await clerkClient.users.getUser(userId);
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
