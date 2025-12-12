-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "financeTransactionId" TEXT;

-- CreateIndex
CREATE INDEX "CalendarEvent_financeTransactionId_idx" ON "CalendarEvent"("financeTransactionId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_financeTransactionId_fkey" FOREIGN KEY ("financeTransactionId") REFERENCES "FinanceTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
