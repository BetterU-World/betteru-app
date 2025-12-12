import { NextRequest, NextResponse } from "next/server";
import { getClerkClient } from "@/lib/clerk";
import { requireUserId } from "@/lib/auth/requireUser";

export async function POST(req: NextRequest) {
  const userId = await requireUserId();

  const client = await getClerkClient();
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
