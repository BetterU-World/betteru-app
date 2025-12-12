-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "userCalendarId" TEXT;

-- CreateTable
CREATE TABLE "UserCalendar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCalendar_userId_idx" ON "UserCalendar"("userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_userCalendarId_idx" ON "CalendarEvent"("userCalendarId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userCalendarId_fkey" FOREIGN KEY ("userCalendarId") REFERENCES "UserCalendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCalendar" ADD CONSTRAINT "UserCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
