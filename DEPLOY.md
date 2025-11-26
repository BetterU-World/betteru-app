# Render Deployment Guide for BetterU

## Quick Deploy

1. **Push to GitHub** (already done if you ran `git push`)

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New" → "Blueprint"
   - Connect your `betteru-app` repo
   - Render will read `render.yaml` and auto-configure everything

3. **Set Environment Variables**
   - Render will prompt you for the environment variables defined in `render.yaml`
   - Add your live Clerk keys:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (your live publishable key)
     - `CLERK_SECRET_KEY` = `sk_live_...` (your live secret key)
   - Get live keys from [Clerk Dashboard](https://dashboard.clerk.com) → API Keys → Production tab

4. **Deploy**
   - Click "Apply" or "Create"
   - Render will build and deploy your app
   - You'll get a live URL like `https://betteru-frontend.onrender.com`

## Update Clerk Settings for Production

After deploying:
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Navigate to your app → "Domains"
- Add your Render domain (e.g., `betteru-frontend.onrender.com`)
- This allows Clerk auth to work on your live site

## Local Development

For local testing with test keys:
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## Notes

- The `render.yaml` at repo root tells Render how to build and run the Next.js app from `frontend/`
- Test keys (`pk_test_...`, `sk_test_...`) are for local dev only
- Live keys (`pk_live_...`, `sk_live_...`) are for production (set in Render dashboard)
- Render free tier: your app may spin down after inactivity, first request takes ~30s to wake up
