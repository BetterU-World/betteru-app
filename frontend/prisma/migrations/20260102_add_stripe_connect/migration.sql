-- Add Stripe Connect fields to User
ALTER TABLE "User" ADD COLUMN "stripeConnectAccountId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeConnectStatus" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeConnectChargesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "stripeConnectPayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "stripeConnectDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;

-- Unique constraint for account id (allows multiple NULLs in Postgres)
ALTER TABLE "User" ADD CONSTRAINT "User_stripeConnectAccountId_key" UNIQUE ("stripeConnectAccountId");
