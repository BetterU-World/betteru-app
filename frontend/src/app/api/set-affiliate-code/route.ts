import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  // Simple code: use first part of userId or something custom
  const existingCode = user.publicMetadata.affiliateCode as
    | string
    | undefined;

  const affiliateCode =
    existingCode || `betteru-${userId.slice(0, 6)}`;

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      affiliateCode,
    },
  });

  return NextResponse.json({ affiliateCode });
}
