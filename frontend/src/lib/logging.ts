import { isZeroTrackingEnabled } from "./privacy";

// Minimal safe logging wrapper. Avoid logging sensitive content.
export async function safeLog(
  userId: string | null,
  message: string,
  meta?: Record<string, unknown>
) {
  try {
    if (!userId) return; // be conservative: avoid logging without user context
    const zeroTracking = await isZeroTrackingEnabled(userId);
    if (zeroTracking) return; // do not log when zero-tracking is enabled

    const redactedMeta = meta ? redactSensitive(meta) : undefined;
    // eslint-disable-next-line no-console
    console.log(message, redactedMeta ?? "");
  } catch {
    // Swallow logging errors; never throw from logging
  }
}

function redactSensitive(meta: Record<string, unknown>) {
  const redacted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (typeof v === "string") {
      // Avoid logging content-like fields
      if (k.toLowerCase().includes("content") || k.toLowerCase().includes("text")) {
        redacted[k] = "[redacted]";
        continue;
      }
    }
    redacted[k] = v;
  }
  return redacted;
}
