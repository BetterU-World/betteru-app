"use client";

// Minimal service worker registration
// - Registers only in production
// - No install prompts; relies on browser-native A2HS
export default function SWRegister() {
  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      // Defer registration until window load to avoid blocking
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {
            // Silently ignore registration errors
          });
      });
    }
  }
  return null;
}
