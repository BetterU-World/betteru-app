# Database Setup Guide

## Overview
BetterU uses PostgreSQL with Prisma ORM for referral tracking, commission management, and payout processing.

## Quick Start (Development)

### Option 1: Prisma Postgres (Recommended for Quick Setup)
```bash
cd frontend
npx create-db
```
This creates a free Prisma Postgres database and updates your DATABASE_URL automatically.

### Option 2: Local PostgreSQL
1. Install PostgreSQL locally or use Docker:
```bash
docker run --name betteru-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

2. Update DATABASE_URL in `.env.local`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/betteru"
```

### Option 3: Cloud PostgreSQL
Use any PostgreSQL provider (Supabase, Neon, Railway, etc.) and update DATABASE_URL.

## Initialize Database

1. Run migrations to create tables:
```bash
cd frontend
npx prisma migrate dev --name init
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. (Optional) Open Prisma Studio to view data:
```bash
npx prisma studio
```

## Database Schema

### Tables
- **User**: Stores user info, affiliate codes, and referral relationships
- **Referral**: Tracks each signup referral and payment status
- **Commission**: Records earnings from referrals
- **Payout**: Manages payout requests and history

### Key Features
- Automatic referral tracking on signup
- Commission creation on successful subscriptions ($10 per paying referral)
- Payout management with $20 minimum
- Full history and analytics

## Syncing Users

After setting up the database, sync your existing Clerk users:

1. Visit `/api/sync-user` (POST request) while logged in
2. Or add a sync button to your dashboard for first-time setup

## Production Setup

1. Use a production PostgreSQL database (Supabase, Neon, Railway, RDS, etc.)
2. Set DATABASE_URL in your deployment environment variables
3. Run migrations in production:
```bash
npx prisma migrate deploy
```

## Troubleshooting

**Error: Can't reach database server**
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: P1001 Can't reach database**
- Database might not be accessible
- Check network connection and credentials

**Migrations failing**
- Try resetting: `npx prisma migrate reset` (⚠️ deletes all data)
- Or create a new migration: `npx prisma migrate dev`

## Notes

- The database is optional for basic functionality
- Clerk metadata is used as fallback when DB is unavailable
- Commission amounts can be configured in webhook handler
- Payout processing requires manual review (admin dashboard coming soon)
