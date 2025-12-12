"use client";

import { useEffect, useState } from "react";

type PrivacySettings = {
  id: string;
  userId: string;
  zeroTrackingMode: boolean;
  diaryLockEnabled: boolean;
};

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/privacy");
        const data = await res.json();
        setSettings(data.settings);
      } catch (e) {
        setError("Failed to load privacy settings");
      }
    })();
  }, []);

  async function toggleZeroTrackingMode() {
    if (!settings) return;
    const next = !settings.zeroTrackingMode;
    if (!next) {
      const confirm = window.confirm(
        "This enables anonymous analytics to help improve the product. No sale of personal data. Continue?"
      );
      if (!confirm) return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/privacy/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zeroTrackingMode: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setSettings({ ...settings, zeroTrackingMode: data.zeroTrackingMode });
      setSuccess("Privacy settings updated");
    } catch (e) {
      setError("Failed to update settings");
    } finally {
      setLoading(false);
    }
  }

  function digitsOnly(value: string) {
    return value.replace(/\D+/g, "");
  }

  function validatePin(pin: string) {
    return /^\d{4,6}$/.test(pin);
  }

  async function refreshSettings() {
    try {
      const res = await fetch("/api/settings/privacy");
      const data = await res.json();
      setSettings(data.settings);
    } catch {}
  }

  async function enableDiaryLock() {
    setError(null);
    setSuccess(null);
    const dOnly = digitsOnly(newPin);
    const cOnly = digitsOnly(confirmPin);
    if (dOnly !== newPin) setNewPin(dOnly);
    if (cOnly !== confirmPin) setConfirmPin(cOnly);
    if (!validatePin(dOnly)) {
      setError("PIN must be 4–6 digits");
      return;
    }
    if (dOnly !== cOnly) {
      setError("PINs do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings/diary-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPin: dOnly }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess("Diary lock enabled");
      setNewPin("");
      setConfirmPin("");
      await refreshSettings();
    } catch {
      setError("Unable to set PIN");
    } finally {
      setLoading(false);
    }
  }

  async function changeDiaryPin() {
    setError(null);
    setSuccess(null);
    const curr = digitsOnly(currentPin);
    const next = digitsOnly(newPin);
    const confirm = digitsOnly(confirmPin);
    if (curr !== currentPin) setCurrentPin(curr);
    if (next !== newPin) setNewPin(next);
    if (confirm !== confirmPin) setConfirmPin(confirm);
    if (!validatePin(curr)) {
      setError("Current PIN must be 4–6 digits");
      return;
    }
    if (!validatePin(next)) {
      setError("New PIN must be 4–6 digits");
      return;
    }
    if (next !== confirm) {
      setError("PINs do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings/diary-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin: curr, newPin: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data && (data.error || data.message) ? (data.error || data.message) : "Unable to change PIN");
        return;
      }
      setSuccess("PIN changed successfully");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      await refreshSettings();
    } catch {
      setError("Unable to change PIN");
    } finally {
      setLoading(false);
    }
  }

  async function disableDiaryLock() {
    setError(null);
    setSuccess(null);
    const curr = digitsOnly(currentPin);
    if (curr !== currentPin) setCurrentPin(curr);
    if (!validatePin(curr)) {
      setError("Current PIN must be 4–6 digits");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings/diary-lock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin: curr }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data && (data.error || data.message) ? (data.error || data.message) : "Unable to disable lock");
        return;
      }
      setSuccess("Diary lock disabled");
      setCurrentPin("");
      await refreshSettings();
    } catch {
      setError("Unable to disable lock");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Privacy & Security</h1>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {success && <div className="text-green-700 mb-3">{success}</div>}
      {!settings ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Zero-Tracking Mode</h2>
            <p className="text-sm text-gray-600 mb-3">
              When enabled, BetterU minimizes data collection and avoids logging sensitive content. Some analytics and diagnostics may be disabled.
            </p>
            <label className="inline-flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.zeroTrackingMode}
                onChange={toggleZeroTrackingMode}
                disabled={loading}
              />
                <span>Enable Zero-Tracking Mode</span>
            </label>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold">Diary Lock</h2>
            <p className="text-sm text-gray-600 mb-3">
              Protect your diary with a passcode (PIN). You can enable or change it from here.
            </p>
            <div className="text-sm text-gray-800">
              Status: {settings.diaryLockEnabled ? "On" : "Off"}
            </div>
            <div className="mt-4 space-y-6">
              {!settings.diaryLockEnabled ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">Enable Diary Lock</h3>
                  <div className="grid gap-3">
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="\d*"
                      value={newPin}
                      onChange={(e) => setNewPin(digitsOnly(e.target.value))}
                      placeholder="New PIN (4–6 digits)"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="\d*"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
                      placeholder="Confirm PIN"
                      className="border rounded px-3 py-2"
                    />
                    <button
                      onClick={enableDiaryLock}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                      Enable Diary Lock
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Change PIN</h3>
                    <div className="grid gap-3">
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
                        placeholder="Current PIN"
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={newPin}
                        onChange={(e) => setNewPin(digitsOnly(e.target.value))}
                        placeholder="New PIN (4–6 digits)"
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
                        placeholder="Confirm New PIN"
                        className="border rounded px-3 py-2"
                      />
                      <button
                        onClick={changeDiaryPin}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      >
                        Change PIN
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Disable Diary Lock</h3>
                    <div className="grid gap-3">
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\d*"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
                        placeholder="Current PIN"
                        className="border rounded px-3 py-2"
                      />
                      <button
                        onClick={disableDiaryLock}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      >
                        Disable Lock
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
