import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { setDiaryLock, disableDiaryLock, verifyDiaryPin } from "@/lib/diaryLock";

function isDigits(pin: string) {
  return /^[0-9]{4,6}$/.test(pin);
}

export async function POST(req: NextRequest) {
  // Set or change diary lock
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { currentPin, newPin } = body ?? {};
  if (!newPin || typeof newPin !== "string" || !isDigits(newPin)) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
  }

  const settings = await (prisma as any).userPrivacySettings.findUnique({ where: { userId: user.id } });
  if (settings?.diaryLockEnabled) {
    // require current pin to change
    if (!currentPin || typeof currentPin !== "string" || !isDigits(currentPin)) {
      return NextResponse.json({ error: "Current PIN required" }, { status: 400 });
    }
    const ok = await verifyDiaryPin(user.id, currentPin);
    if (!ok) return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 });
  }

  await setDiaryLock(user.id, newPin);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  // Disable diary lock
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { currentPin } = body ?? {};
  if (!currentPin || typeof currentPin !== "string" || !isDigits(currentPin)) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
  }

  const ok = await verifyDiaryPin(user.id, currentPin);
  if (!ok) return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 });

  await disableDiaryLock(user.id);
  return NextResponse.json({ success: true });
}

// Verify PIN and set a short-lived cookie flag
export async function PATCH(req: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { pin } = body ?? {};
  if (!pin || typeof pin !== "string" || !isDigits(pin)) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
  }

  const ok = await verifyDiaryPin(user.id, pin);
  if (!ok) return NextResponse.json({ error: "Incorrect PIN" }, { status: 403 });

  // Set a cookie `diary_unlocked=true` for 30 minutes
  const res = NextResponse.json({ success: true });
  res.cookies.set("diary_unlocked", "true", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 30,
    sameSite: "lax",
    secure: true,
  });
  return res;
}
