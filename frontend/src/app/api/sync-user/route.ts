import { NextRequest, NextResponse } from "next/server";
import { getClerkClient } from "@/lib/clerk";
import { requireUserId } from "@/lib/auth/requireUser";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();

    const client = await getClerkClient();
    const clerkUser = await client.users.getUser(userId);

    const affiliateCode =
      (clerkUser.publicMetadata.affiliateCode as string) ||
      `betteru-${userId.slice(0, 6)}`;

    const referredBy = clerkUser.unsafeMetadata?.referredBy as string | null;

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        affiliateCode,
        referredBy: referredBy || null,
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        affiliateCode,
        referredBy: referredBy || null,
      },
    });

    // If user was referred, create referral record
    if (referredBy && referredBy !== affiliateCode) {
      const referrer = await prisma.user.findUnique({
        where: { affiliateCode: referredBy },
      });

      if (referrer) {
        // Check if referral already exists
        const existingReferral = await prisma.referral.findFirst({
          where: {
            userId: referrer.id,
            referredUserId: userId,
          },
        });

        if (!existingReferral) {
          await prisma.referral.create({
            data: {
              userId: referrer.id,
              referredUserId: userId,
              referredEmail: user.email,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
