-- AlterTable: Make id columns optional by allowing them to be generated
-- Prisma will handle cuid() generation at the application level
-- We just need to mark these as no longer requiring manual input

-- Add default expressions for updatedAt columns
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Referral" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;