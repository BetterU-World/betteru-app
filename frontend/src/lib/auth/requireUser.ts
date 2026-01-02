import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";
import { getClerkUserId, getClerkClient } from "@/lib/clerk";

export async function requireUserId(): Promise<string> {
  const userId = await getClerkUserId();
  if (!userId) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

export async function requireDbUser(): Promise<User> {
  const clerkId = await requireUserId();
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  // Bootstrap user from Clerk, mirroring /api/sync-user fields
  const client = await getClerkClient();
  const clerkUser = await client.users.getUser(clerkId);

  const affiliateCode =
    (clerkUser.publicMetadata.affiliateCode as string) ||
    `betteru-${clerkId.slice(0, 6)}`;

  const referredBy = (clerkUser.unsafeMetadata?.referredBy as string | null) || null;

  const upserted = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      affiliateCode,
      referredBy,
    },
    create: {
      clerkId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      affiliateCode,
      referredBy,
    },
  });

  return upserted;
}
