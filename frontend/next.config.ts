import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow Codespaces and local origins to avoid x-forwarded-host/origin mismatch in dev
      allowedOrigins: [
        "localhost:3000",
        "stunning-couscous-q7jvw665g4jr29gxr-3000.app.github.dev",
        "*.app.github.dev",
      ],
    },
  },
};

export default nextConfig;
