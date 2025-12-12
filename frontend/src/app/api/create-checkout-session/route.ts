import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs"; // ensure we can read the raw body / use Stripe properly
export const dynamic = "force-dynamic";

const priceId = process.env.STRIPE_PRICE_ID;

if (!priceId) {
  throw new Error("Missing STRIPE_PRICE_ID in environment");
}

export async function POST(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";
    const { affiliateCode, userId } = await req.json().catch(() => ({
      affiliateCode: "",
      userId: "",
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/affiliate?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancel`,
      metadata: {
        affiliateCode: affiliateCode || "",
        userId: userId || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error in create-checkout-session route:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
