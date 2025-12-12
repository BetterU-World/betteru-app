import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { encryptText, makePreview } from "@/lib/encryption";

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Optional: scope to current user only; for now migrate all of user's records
    const userId = clerkUserId ? await (await import("@/lib/user-helpers")).getPrismaUserIdFromClerk(clerkUserId) : null;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const batchSize = 200;
    let updated = 0;

    while (true) {
      const items = await prisma.financeTransaction.findMany({
        where: { userId, encryptedDetails: null },
        orderBy: { createdAt: "asc" },
        take: batchSize,
      } as any);
      if (!items.length) break;
      for (const t of items) {
        const details = (t.description || "").trim();
        if (!details) {
          await prisma.financeTransaction.update({
            where: { id: t.id },
            data: { description: "", encryptedDetails: null, detailsPreview: null },
          } as any);
          continue;
        }
        try {
          const encryptedDetails = encryptText(details);
          const detailsPreview = makePreview(details);
          await prisma.financeTransaction.update({
            where: { id: t.id },
            data: { description: "", encryptedDetails, detailsPreview },
          } as any);
          updated++;
        } catch (e: any) {
          // continue on errors
        }
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (e) {
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
