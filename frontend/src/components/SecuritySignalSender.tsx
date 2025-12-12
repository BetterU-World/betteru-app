"use client";

export default function SecuritySignalSender() {
  // Send once per day
  const KEY = "betteru_security_signal_last_sent";

  async function genDeviceHash(): Promise<string> {
    const seedKey = "betteru_device_seed";
    let seed = localStorage.getItem(seedKey);
    if (!seed) {
      seed = Math.random().toString(36).slice(2);
      localStorage.setItem(seedKey, seed);
    }
    const userAgent = navigator.userAgent || "";
    const lang = navigator.language || "";
    const tz = String(new Date().getTimezoneOffset());
    const input = `${userAgent}|${lang}|${tz}|${seed}`;
    const enc = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    const bytes = new Uint8Array(digest);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function send() {
    try {
      const last = localStorage.getItem(KEY);
      const now = Date.now();
      if (last && now - Number(last) < 24 * 60 * 60 * 1000) return; // 1 day
      const deviceHash = await genDeviceHash();
      await fetch("/api/security/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceHash }),
      });
      localStorage.setItem(KEY, String(now));
    } catch {
      // Fail silently
    }
  }

  // Fire on mount (auth/layout mounts post-gate)
  if (typeof window !== "undefined") {
    // microtask to avoid blocking paint
    Promise.resolve().then(send);
  }

  return null;
}
