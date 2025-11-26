import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

export const runtime = "nodejs"; // important for raw body

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Missing webhook secret", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text(); // raw body
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get email + customer id from session
        const email =
          (session.customer_email as string) ||
          ((session.customer_details?.email as string) ?? null);
        const customerId = session.customer as string | null;

        if (!email || !customerId) break;

        // Find Clerk user by email
        const users = await clerkClient.users.getUserList({
          emailAddress: [email],
        });

        const user = users.data[0];
        if (!user) break;

        await clerkClient.users.updateUser(user.id, {
          privateMetadata: {
            ...user.privateMetadata,
            stripeCustomerId: customerId,
            stripeSubscriptionStatus: "active",
            stripeSubscriptionId:
              (session.subscription as string | undefined) ?? null,
          },
          publicMetadata: {
            ...user.publicMetadata,
            isPro: true,
          },
        });

        console.log(`User ${user.id} marked as Pro with customer ${customerId}`);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId = subscription.customer as string;
        const status = subscription.status; // 'active', 'canceled', etc.

        // Note: Finding user by stripeCustomerId requires a DB lookup.
        // For now, we just log it. Real implementation would query your DB.
        console.log(
          "Subscription updated for customer",
          customerId,
          "status:",
          status
        );

        // Simplified: Mark as not Pro if canceled/incomplete
        if (status === "canceled" || status === "incomplete_expired") {
          // Would need to find user by customerId from your DB
          console.log(`Customer ${customerId} subscription canceled/expired`);
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handling error:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
