# Frontend (Next.js + Clerk)

This directory contains a Next.js (App Router) scaffold and a minimal Clerk integration (App Router approach).

Setup
1. Copy `.env.example` to `.env.local` and add your Clerk keys.
2. From `frontend/`, run `npm install` to install dependencies.
3. Run `npm run dev` to start the dev server.

Notes
- This scaffold adheres to Clerk's App Router integration: middleware.ts uses `clerkMiddleware()` and the app is wrapped with `<ClerkProvider>` in `src/app/layout.tsx`.
- Do NOT commit real keys. Keep secrets in `.env.local` which is gitignored.
