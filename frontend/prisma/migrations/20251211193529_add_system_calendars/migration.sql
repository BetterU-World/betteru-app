-- CreateEnum
CREATE TYPE "CalendarType" AS ENUM ('SYSTEM', 'CUSTOM');

-- AlterTable
ALTER TABLE "UserCalendar" ADD COLUMN     "type" "CalendarType" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "UserCalendar_userId_slug_key" ON "UserCalendar"("userId", "slug");
