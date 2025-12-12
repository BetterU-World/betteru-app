import prisma from "@/lib/prisma";
import { encryptDiaryContent, makePreview } from "@/lib/encryption";

async function run() {
  console.log("Starting diary encryption backfill...");
  const batch = await prisma.diaryEntry.findMany({
    where: {
      encryptedContent: null,
      OR: [{ content: { not: null } }, { content: { not: "" } }],
    },
    select: { id: true, content: true },
  });
  console.log(`Found ${batch.length} entries to backfill`);

  for (const row of batch) {
    try {
      const plaintext = row.content ?? "";
      const encrypted = encryptDiaryContent(plaintext);
      const preview = makePreview(plaintext);
      await prisma.diaryEntry.update({
        where: { id: row.id },
        data: { encryptedContent: encrypted, contentPreview: preview, content: "" },
      });
    } catch (e) {
      console.warn(`Failed to encrypt entry ${row.id}`);
    }
  }
  console.log("Backfill complete.");
  await (prisma as any).$disconnect?.();
}

run().catch((e) => {
  console.error("Backfill script error", e);
  process.exit(1);
});
