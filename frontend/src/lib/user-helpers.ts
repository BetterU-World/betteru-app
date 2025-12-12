import prisma from "@/lib/prisma";

/**
 * Get the Prisma user ID from a Clerk user ID
 */
export async function getPrismaUserIdFromClerk(
  clerkUserId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  return user?.id ?? null;
}
