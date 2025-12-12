-- AlterTable
ALTER TABLE "DiaryEntry" ADD COLUMN     "contentAlg" TEXT,
ADD COLUMN     "contentCiphertext" TEXT,
ADD COLUMN     "contentIv" TEXT,
ADD COLUMN     "contentSalt" TEXT,
ALTER COLUMN "content" SET DEFAULT '';

-- AlterTable
ALTER TABLE "UserPrivacySettings" ADD COLUMN     "diaryPinSalt" TEXT;
