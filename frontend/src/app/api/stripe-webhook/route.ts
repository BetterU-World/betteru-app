import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { calculateRevenueSplit } from "@/lib/payments";

export const runtime = "nodejs"; // important for raw body

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
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
        const client = await clerkClient();
        const users = await client.users.getUserList({
          emailAddress: [email],
        });

        const user = users.data[0];
        if (!user) break;

        await client.users.updateUser(user.id, {
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

        // Track referral commission and charity allocation using centralized revenue split
        try {
          const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
          });

          if (!dbUser) {
            console.log("Database user not found, skipping revenue split");
            break;
          }

          // Calculate revenue split (30% affiliate, 10% charity, 60% business)
          const subscriptionAmount = session.amount_total || 0; // Amount in cents
          const gross = subscriptionAmount / 100; // Convert to dollars

          // Find referral record to determine if affiliate exists
          const referral = await prisma.referral.findFirst({
            where: { referredUserId: user.id },
          });

          const hasAffiliate = !!referral;
          const split = calculateRevenueSplit(gross, hasAffiliate);

          console.log(`Revenue split for ${gross}: affiliate=${split.affiliateAmount}, charity=${split.charityAmount}, business=${split.businessNet}`);

          // If referral exists, create commission and mark as paying
          if (referral) {
            await prisma.referral.update({
              where: { id: referral.id },
              data: {
                isPaying: true,
                subscriptionId: session.subscription as string,
              },
            });

            await prisma.commission.create({
              data: {
                userId: referral.userId,
                referralId: referral.id,
                amount: split.affiliateAmount,
                currency: session.currency || "usd",
                type: "subscription",
                stripeEventId: event.id,
                status: "approved",
              },
            });

            console.log(`Created commission of $${split.affiliateAmount} for referrer ${referral.userId}`);
          }

          // Always create charity allocation (10% of gross)
          await prisma.charityAllocation.create({
            data: {
              userId: dbUser.id,
              amount: split.charityAmount,
              currency: session.currency || "usd",
              stripeEventId: event.id,
            },
          });

          console.log(`Created charity allocation of $${split.charityAmount} for user ${dbUser.id}`);
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          // Don't fail the webhook if DB is not set up yet
        }

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
