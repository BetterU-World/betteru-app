-- CreateTable
CREATE TABLE "CharityAllocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharityAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharityAllocation_stripeEventId_key" ON "CharityAllocation"("stripeEventId");

-- CreateIndex
CREATE INDEX "CharityAllocation_createdAt_idx" ON "CharityAllocation"("createdAt");
