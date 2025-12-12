import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isValidPin(pin: string) {
  return /^[0-9]{4,6}$/.test(pin);
}

export async function setDiaryLock(userId: string, pin: string) {
  if (!isValidPin(pin)) throw new Error("PIN must be 4–6 digits");
  const hash = await bcrypt.hash(pin, 12);
  return prisma.userPrivacySettings.upsert({
    where: { userId },
    update: { diaryLockEnabled: true, diaryLockHash: hash },
    create: { userId, diaryLockEnabled: true, diaryLockHash: hash },
  });
}

export async function disableDiaryLock(userId: string) {
  return prisma.userPrivacySettings.update({
    where: { userId },
    data: { diaryLockEnabled: false, diaryLockHash: null },
  });
}

export async function verifyDiaryPin(userId: string, pin: string) {
  const settings = await prisma.userPrivacySettings.findUnique({ where: { userId } });
  if (!settings?.diaryLockEnabled) return true;
  if (!settings.diaryLockHash) return false;
  return bcrypt.compare(pin, settings.diaryLockHash);
}
