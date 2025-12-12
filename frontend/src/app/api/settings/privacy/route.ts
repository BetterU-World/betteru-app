import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserPrivacySettings, updateUserPrivacySettings } from "@/lib/privacy";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const settings = await getUserPrivacySettings(user.id);
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { zeroTrackingMode } = body ?? {};
  if (zeroTrackingMode !== undefined && typeof zeroTrackingMode !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await updateUserPrivacySettings(user.id, {
    zeroTrackingMode: zeroTrackingMode,
  });
  return NextResponse.json({ settings: updated });
}
