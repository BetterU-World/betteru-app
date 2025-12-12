-- CreateEnum
CREATE TYPE "DiaryMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImageUrl" TEXT;

-- CreateTable
CREATE TABLE "DiaryMedia" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DiaryMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiaryMedia_entryId_idx" ON "DiaryMedia"("entryId");

-- CreateIndex
CREATE INDEX "DiaryMedia_userId_idx" ON "DiaryMedia"("userId");

-- AddForeignKey
ALTER TABLE "DiaryMedia" ADD CONSTRAINT "DiaryMedia_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DiaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryMedia" ADD CONSTRAINT "DiaryMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
