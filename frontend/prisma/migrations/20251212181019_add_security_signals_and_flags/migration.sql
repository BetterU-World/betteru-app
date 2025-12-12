-- CreateEnum
CREATE TYPE "SecurityFlagType" AS ENUM ('MULTI_ACCOUNT_SUSPECTED', 'IP_REUSE_HIGH', 'DEVICE_REUSE_HIGH');

-- CreateTable
CREATE TABLE "UserSecuritySignal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenIp" TEXT,
    "lastSeenUserAgent" TEXT,
    "deviceHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSecuritySignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityFlag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SecurityFlagType" NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSecuritySignal_userId_key" ON "UserSecuritySignal"("userId");

-- CreateIndex
CREATE INDEX "UserSecuritySignal_lastSeenIp_idx" ON "UserSecuritySignal"("lastSeenIp");

-- CreateIndex
CREATE INDEX "UserSecuritySignal_deviceHash_idx" ON "UserSecuritySignal"("deviceHash");

-- CreateIndex
CREATE INDEX "SecurityFlag_userId_idx" ON "SecurityFlag"("userId");

-- CreateIndex
CREATE INDEX "SecurityFlag_type_idx" ON "SecurityFlag"("type");

-- CreateIndex
CREATE INDEX "SecurityFlag_createdAt_idx" ON "SecurityFlag"("createdAt");

-- AddForeignKey
ALTER TABLE "UserSecuritySignal" ADD CONSTRAINT "UserSecuritySignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityFlag" ADD CONSTRAINT "SecurityFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
