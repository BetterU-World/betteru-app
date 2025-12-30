import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function setSecurityHeaders(res: NextResponse) {
  // In development, do not set CSP to avoid blocking Next.js dev tooling (eval, inline scripts, HMR websockets).
  // In production, set a conservative CSP compatible with Clerk/Stripe.
  if (process.env.NODE_ENV === "production") {
    const clerkFrontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API;
    const clerkSources = [
      "https://*.clerk.com",
      "https://*.clerk.dev",
      "https://*.clerk.accounts",
    ];
    if (clerkFrontendApi) {
      clerkSources.push(`https://${clerkFrontendApi}`);
    }

    const csp = [
      // Keep defaults strict
      "default-src 'self'",
      // Allow Clerk script hosting domains; do not enable unsafe-eval/inline for scripts
      ["script-src 'self'", ...clerkSources].join(" "),
      // Allow inline styles (Clerk UI often injects styles)
      "style-src 'self' 'unsafe-inline'",
      // Permit images from Clerk plus data/blob URIs
      ["img-src 'self' data: blob:", ...clerkSources].join(" "),
      // Permit fonts from self and data URIs
      "font-src 'self' data:",
      // Permit XHR/fetch/WebSocket to Clerk APIs and Stripe
      [
        "connect-src 'self' https://api.clerk.com https://*.stripe.com",
        ...clerkSources,
      ].join(" "),
      // Prevent embedding by other sites
      "frame-ancestors 'none'",
      // Permit frames for Stripe and Clerk (for hosted widgets)
      ["frame-src https://*.stripe.com", ...clerkSources].join(" "),
      // Media and object rules remain strict
      "media-src 'self' blob:",
      "object-src 'none'",
    ].join("; ");
    res.headers.set("Content-Security-Policy", csp);
    // Temporary debug header to verify CSP in production responses
    res.headers.set("X-Debug-CSP", csp);
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
  // Gateway and public marketing/landing
  "/",
  "/invite(.*)",
  "/landing(.*)",
  "/checkout(.*)",
  "/success(.*)",
  // Clerk auth routes must remain publicly accessible
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/oauth-callback(.*)",
  // API and Next internals
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
// middleware config is declared in middleware.ts per Next.js requirements
