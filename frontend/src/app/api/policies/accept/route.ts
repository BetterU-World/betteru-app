import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/policies";

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { isAdultConfirmed, acceptTerms, acceptPrivacy } = body || {};
    if (!(isAdultConfirmed && acceptTerms && acceptPrivacy)) {
      return NextResponse.json({ error: "All confirmations required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isAdultConfirmed: true,
        adultConfirmedAt: now,
        acceptedTermsVersion: TERMS_VERSION,
        acceptedTermsAt: now,
        acceptedPrivacyVersion: PRIVACY_VERSION,
        acceptedPrivacyAt: now,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save acceptance" }, { status: 500 });
  }
}
