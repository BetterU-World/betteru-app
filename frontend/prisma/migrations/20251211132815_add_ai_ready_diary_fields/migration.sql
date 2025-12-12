-- AlterTable
ALTER TABLE "DiaryEntry" ADD COLUMN     "mood" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "title" DROP NOT NULL;
