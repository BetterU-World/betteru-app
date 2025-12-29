-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "moodInt" INTEGER,
    "energyInt" INTEGER,
    "stressInt" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyState_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyState"
ADD CONSTRAINT "DailyState_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DailyState_userId_dayKey_key" ON "DailyState"("userId", "dayKey");
CREATE INDEX IF NOT EXISTS "DailyState_userId_idx" ON "DailyState"("userId");
