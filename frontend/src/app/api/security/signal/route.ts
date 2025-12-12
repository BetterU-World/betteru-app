import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const xr = req.headers.get("x-real-ip") || "";
  const ip = xf.split(",")[0]?.trim() || xr || "";
  return ip;
}

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const deviceHash = (body?.deviceHash as string) || null;
    const ip = getClientIp(request) || null;
    const ua = request.headers.get("user-agent") || null;

    await prisma.userSecuritySignal.upsert({
      where: { userId: user.id },
      update: { lastSeenIp: ip || undefined, lastSeenUserAgent: ua || undefined, deviceHash: deviceHash || undefined },
      create: { userId: user.id, lastSeenIp: ip || undefined, lastSeenUserAgent: ua || undefined, deviceHash: deviceHash || undefined },
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Device reuse counts (last 30 days)
    let deviceUsersCount = 0;
    let deviceUsers: string[] = [];
    if (deviceHash) {
      const signals = await prisma.userSecuritySignal.findMany({ where: { deviceHash }, select: { userId: true } });
      const uniq = Array.from(new Set(signals.map((s) => s.userId))).filter((id) => id !== user.id);
      deviceUsersCount = uniq.length;
      deviceUsers = uniq;
    }

    // IP reuse counts (last 7 days)
    let ipUsersCount = 0;
    let ipUsers: string[] = [];
    if (ip) {
      const signals = await prisma.userSecuritySignal.findMany({ where: { lastSeenIp: ip }, select: { userId: true } });
      const uniq = Array.from(new Set(signals.map((s) => s.userId))).filter((id) => id !== user.id);
      ipUsersCount = uniq.length;
      ipUsers = uniq;
    }

    async function createFlagIfNeeded(type: "MULTI_ACCOUNT_SUSPECTED" | "IP_REUSE_HIGH" | "DEVICE_REUSE_HIGH", severity: number, reason: string, metadata: any) {
      const recentUnresolved = await prisma.securityFlag.findFirst({
        where: { userId: user.id, type, resolvedAt: null, createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
      });
      if (recentUnresolved) return;
      await prisma.securityFlag.create({
        data: { userId: user.id, type, severity, reason, metadata },
      });
    }

    // Thresholds and flags
    if (deviceHash && deviceUsersCount >= 2) {
      await createFlagIfNeeded(
        "MULTI_ACCOUNT_SUSPECTED",
        3,
        "Same device used by multiple accounts in last 30 days",
        { deviceHash, deviceUsersCount, deviceUsers }
      );
    }

    if (ip && ipUsersCount >= 4) {
      await createFlagIfNeeded(
        "IP_REUSE_HIGH",
        2,
        "Same IP used by many accounts in last 7 days",
        { ip, ipUsersCount, ipUsers }
      );
    }

    if (deviceHash && deviceUsersCount >= 3) {
      await createFlagIfNeeded(
        "DEVICE_REUSE_HIGH",
        4,
        "High device reuse across accounts in last 30 days",
        { deviceHash, deviceUsersCount, deviceUsers }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to record signal" }, { status: 500 });
  }
}
