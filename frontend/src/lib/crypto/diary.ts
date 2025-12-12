// Client-side Web Crypto utilities for diary content encryption/decryption
// Uses AES-GCM with PBKDF2-derived key. Never logs plaintext or PIN.

export type EncryptedDiaryPayload = {
  ciphertextB64: string;
  ivB64: string;
  saltB64: string;
  alg: "AES-GCM";
};

function toUint8Array(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function toBase64(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

export async function deriveKeyFromPin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Create a typed view to satisfy BufferSource without ArrayBuffer|SharedArrayBuffer union issues
  const saltCopy = new Uint8Array(salt);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltCopy,
      iterations: 210_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptDiaryContent(pin: string, plaintext: string): Promise<EncryptedDiaryPayload> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPin(pin, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    ciphertextB64: toBase64(ciphertext),
    ivB64: toBase64(iv.buffer),
    saltB64: toBase64(salt.buffer),
    alg: "AES-GCM",
  };
}

export async function decryptDiaryContent(pin: string, payload: EncryptedDiaryPayload): Promise<string> {
  const { ciphertextB64, ivB64, saltB64 } = payload;
  const salt = toUint8Array(saltB64);
  const ivRaw = toUint8Array(ivB64);
  const ctRaw = toUint8Array(ciphertextB64);
  const key = await deriveKeyFromPin(pin, salt);
  // Fresh views to satisfy BufferSource typing
  const iv = new Uint8Array(ivRaw);
  const ct = new Uint8Array(ctRaw);
  const plaintextBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(plaintextBuf);
}
