import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function setSecurityHeaders(res: NextResponse) {
  // In development, do not set CSP to avoid blocking Next.js dev tooling (eval, inline scripts, HMR websockets).
  // In production, set a conservative CSP compatible with Clerk/Stripe.
  if (process.env.NODE_ENV === "production") {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.clerk.com https://*.stripe.com",
      "frame-ancestors 'none'",
      "frame-src https://*.stripe.com",
      "media-src 'self' blob:",
      "object-src 'none'",
    ].join("; ");
    res.headers.set("Content-Security-Policy", csp);
  } else {
    // Dev-only notice: avoid logging user content.
    console.warn("[Security] CSP disabled in development to avoid Next.js dev tooling breakage.");
  }
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.headers.set("X-Frame-Options", "DENY");
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

const isPublicRoute = createRouteMatcher([
  "/invite(.*)",
  "/landing(.*)",
  "/checkout(.*)",
  "/success(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/_next/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes and Next static/_next assets (excluded via matcher)
  if (isPublicRoute(req)) {
    return setSecurityHeaders(NextResponse.next());
  }

  // Phase C minimal: gate only on Clerk auth; no DB lookups here (Edge-safe)
  const { userId } = await auth();
  if (!userId) {
    if (process.env.NODE_ENV !== "production") console.log("[gate] unauthenticated -> /landing");
    return setSecurityHeaders(NextResponse.redirect(new URL("/landing", req.url)));
  }

  return setSecurityHeaders(NextResponse.next());
});

// Protect all routes except static files and Next internals
export const config = {
  matcher: [
    // Exclude Next internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
