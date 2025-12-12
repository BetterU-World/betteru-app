-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptedPrivacyAt" TIMESTAMP(3),
ADD COLUMN     "acceptedPrivacyVersion" TEXT,
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3),
ADD COLUMN     "acceptedTermsVersion" TEXT,
ADD COLUMN     "adultConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "isAdultConfirmed" BOOLEAN NOT NULL DEFAULT false;
