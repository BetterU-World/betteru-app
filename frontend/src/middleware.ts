import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Protect all routes except static files and Next internals
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
