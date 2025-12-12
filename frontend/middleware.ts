import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "./src/lib/prisma";
import { needsPolicyAcceptance } from "./src/lib/policies";

const ALLOW_PATHS = [
  "/onboarding",
  "/terms",
  "/privacy",
  "/api",
  "/signin",
  "/sign-in",
  "/sign-up",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ALLOW_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.next();
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.next();
    const u: any = user as any;
    const needs = needsPolicyAcceptance({
      isAdultConfirmed: u.isAdultConfirmed,
      adultConfirmedAt: u.adultConfirmedAt,
      acceptedTermsVersion: u.acceptedTermsVersion,
      acceptedTermsAt: u.acceptedTermsAt,
      acceptedPrivacyVersion: u.acceptedPrivacyVersion,
      acceptedPrivacyAt: u.acceptedPrivacyAt,
    });
    if (needs) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  } catch {
    // On errors, allow request to proceed (avoid hard lockouts)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"]
};
