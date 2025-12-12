-- AlterTable
ALTER TABLE "User" ADD COLUMN     "analyticsOptInAt" TIMESTAMP(3),
ADD COLUMN     "zeroTrackingMode" BOOLEAN NOT NULL DEFAULT true;
