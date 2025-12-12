import crypto from "node:crypto";

function getKey(): Buffer {
  const raw = process.env.DIARY_ENCRYPTION_KEY || "";
  if (!raw) throw new Error("DIARY_ENCRYPTION_KEY not set");
  let key: Buffer;
  if (/^[A-Fa-f0-9]+$/.test(raw) && raw.length === 64) {
    key = Buffer.from(raw, "hex");
  } else {
    // assume base64
    key = Buffer.from(raw, "base64");
  }
  if (key.length !== 32) throw new Error("DIARY_ENCRYPTION_KEY must be 32 bytes");
  return key;
}

export function encryptDiaryContent(plaintext: string): string {
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

export function decryptDiaryContent(ciphertextBlob: string): string {
  const key = getKey();
  try {
    const decoded = Buffer.from(ciphertextBlob, "base64").toString("utf8");
    const blob = JSON.parse(decoded);
    if (!blob || !blob.iv || !blob.ct || !blob.tag) {
      throw new Error("Malformed ciphertext blob");
    }
    const iv = Buffer.from(blob.iv, "base64");
    const ct = Buffer.from(blob.ct, "base64");
    const tag = Buffer.from(blob.tag, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
    return plaintext;
  } catch (e) {
    throw new Error("Failed to decrypt diary content");
  }
}

export function makePreview(plaintext: string, max = 100): string {
  const trimmed = plaintext.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, max);
}

// Generic aliases for non-diary text encryption (e.g., finance details)
export const encryptText = encryptDiaryContent;
export const decryptText = decryptDiaryContent;

// Binary helpers for media encryption
export function encryptBuffer(plaintext: Buffer): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const blob = {
    iv: iv.toString("base64"),
    ct: ciphertext.toString("base64"),
    tag: authTag.toString("base64"),
    v: 1,
  };
  return Buffer.from(JSON.stringify(blob)).toString("base64");
}

export function decryptBuffer(ciphertextBlob: string): Buffer {
  const key = getKey();
  const decoded = Buffer.from(ciphertextBlob, "base64").toString("utf8");
  const blob = JSON.parse(decoded);
  if (!blob || !blob.iv || !blob.ct || !blob.tag) {
    throw new Error("Malformed ciphertext blob");
  }
  const iv = Buffer.from(blob.iv, "base64");
  const ct = Buffer.from(blob.ct, "base64");
  const tag = Buffer.from(blob.tag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext;
}
