-- CreateTable
CREATE TABLE "AvatarFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvatarFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryAttachment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvatarFile_userId_key" ON "AvatarFile"("userId");

-- CreateIndex
CREATE INDEX "DiaryAttachment_userId_idx" ON "DiaryAttachment"("userId");

-- CreateIndex
CREATE INDEX "DiaryAttachment_diaryEntryId_idx" ON "DiaryAttachment"("diaryEntryId");

-- AddForeignKey
ALTER TABLE "AvatarFile" ADD CONSTRAINT "AvatarFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryAttachment" ADD CONSTRAINT "DiaryAttachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryAttachment" ADD CONSTRAINT "DiaryAttachment_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
