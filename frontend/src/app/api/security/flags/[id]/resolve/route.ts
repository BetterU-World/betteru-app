import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function isAdminEmail(email: string | null | undefined) {
  const env = process.env.ADMIN_EMAILS || "";
  const allow = env.split(",").map((e) => e.trim()).filter(Boolean);
  return email ? allow.includes(email) : false;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const flag = await prisma.securityFlag.update({ where: { id }, data: { resolvedAt: new Date() } });
    return NextResponse.json({ ok: true, flag });
  } catch (e) {
    return NextResponse.json({ error: "Failed to resolve flag" }, { status: 500 });
  }
}
