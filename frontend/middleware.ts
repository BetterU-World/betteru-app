import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware();

// Protect all routes except static files and the next internals
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
