import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { zeroTrackingMode } = body || {};
    if (typeof zeroTrackingMode !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const data: any = { zeroTrackingMode };
    if (zeroTrackingMode === false && !user.analyticsOptInAt) {
      data.analyticsOptInAt = new Date();
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ ok: true, zeroTrackingMode: updated.zeroTrackingMode, analyticsOptInAt: updated.analyticsOptInAt });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update privacy settings" }, { status: 500 });
  }
}
