import prisma from "@/lib/prisma";

export async function getUserPrivacySettings(userId: string) {
  let settings = await prisma.userPrivacySettings.findUnique({
    where: { userId },
  });
  if (!settings) {
    settings = await prisma.userPrivacySettings.create({
      data: { userId },
    });
  }
  return settings;
}

export async function updateUserPrivacySettings(
  userId: string,
  data: Partial<{ zeroTrackingMode: boolean; diaryLockEnabled: boolean; diaryLockHash: string | null }>
) {
  // Only allow specific fields
  const allowed: any = {};
  if (typeof data.zeroTrackingMode === "boolean") {
    allowed.zeroTrackingMode = data.zeroTrackingMode;
  }
  if (typeof data.diaryLockEnabled === "boolean") {
    allowed.diaryLockEnabled = data.diaryLockEnabled;
  }
  if (data.diaryLockHash !== undefined) {
    allowed.diaryLockHash = data.diaryLockHash;
  }

  const updated = await prisma.userPrivacySettings.upsert({
    where: { userId },
    update: allowed,
    create: { userId, ...allowed },
  });
  return updated;
}

export async function isZeroTrackingEnabled(userId: string) {
  const settings = await prisma.userPrivacySettings.findUnique({ where: { userId } });
  return !!settings?.zeroTrackingMode;
}
