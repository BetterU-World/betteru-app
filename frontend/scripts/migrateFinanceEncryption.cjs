// CommonJS backfill script for finance encryption
const { PrismaClient } = require("@prisma/client");
const crypto = require("node:crypto");
const prisma = new PrismaClient();

function getKey() {
  const raw = process.env.DIARY_ENCRYPTION_KEY || "";
  if (!raw) throw new Error("DIARY_ENCRYPTION_KEY not set");
  let key;
  if (/^[A-Fa-f0-9]+$/.test(raw) && raw.length === 64) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }
  if (key.length !== 32) throw new Error("DIARY_ENCRYPTION_KEY must be 32 bytes");
  return key;
}

function encryptText(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const blob = {
    iv: iv.toString("base64"),
    ct: ciphertext.toString("base64"),
    tag: authTag.toString("base64"),
    v: 1,
  };
  return Buffer.from(JSON.stringify(blob)).toString("base64");
}

function makePreview(plaintext, max = 100) {
  const trimmed = plaintext.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, max);
}

async function run() {
  const start = Date.now();
  const batchSize = 100;
  let total = 0;

  const filter = {
    where: {
      OR: [
        { encryptedDetails: null, description: { not: "" } },
        { encryptedDetails: null, description: { not: null } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  };

  console.log("Starting finance encryption backfill...");

  while (true) {
    const items = await prisma.financeTransaction.findMany(filter);
    if (!items.length) break;

    for (const t of items) {
      const details = (t.description || "").trim();
      if (!details) {
        await prisma.financeTransaction.update({
          where: { id: t.id },
          data: { description: "", encryptedDetails: null, detailsPreview: null },
        });
        continue;
      }
      try {
        const encryptedDetails = encryptText(details);
        const detailsPreview = makePreview(details);
        await prisma.financeTransaction.update({
          where: { id: t.id },
          data: { description: "", encryptedDetails, detailsPreview },
        });
        total++;
      } catch (e) {
        console.error(`Failed to encrypt transaction ${t.id}:`, e.message);
      }
    }
  }

  const ms = Date.now() - start;
  console.log(`Backfill complete. Updated ${total} transactions in ${ms}ms.`);
}

run()
  .catch((e) => {
    console.error("Backfill error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
