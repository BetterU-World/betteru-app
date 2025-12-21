"use client";

import { useEffect, useState } from "react";

export default function SettingsPreferencesClient() {
  const [zeroTracking, setZeroTracking] = useState<boolean>(false);
  const [notifInapp, setNotifInapp] = useState<boolean>(true);
  const [notifPush, setNotifPush] = useState<boolean>(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const zt = localStorage.getItem("betteru_zero_tracking");
      const inapp = localStorage.getItem("betteru_notif_inapp");
      const push = localStorage.getItem("betteru_notif_push");
      setZeroTracking(zt === "1");
      setNotifInapp(inapp !== "0");
      setNotifPush(push === "1");
    } catch {}
  }, []);

  const persist = (key: string, val: boolean) => {
    try {
      localStorage.setItem(key, val ? "1" : "0");
    } catch {}
  };

  return (
    <>
      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-3">
        <h2 className="font-semibold text-lg">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-900">Zero-Tracking Mode</div>
            <p className="text-xs text-slate-600">Disables non-essential tracking. BetterU never sells data.</p>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={zeroTracking}
              onChange={(e) => {
                setZeroTracking(e.target.checked);
                persist("betteru_zero_tracking", e.target.checked);
              }}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">{zeroTracking ? "On" : "Off"}</span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-3">
        <h2 className="font-semibold text-lg">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">In-app notifications</div>
              <p className="text-xs text-slate-600">Shows gentle updates inside BetterU.</p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifInapp}
                onChange={(e) => {
                  setNotifInapp(e.target.checked);
                  persist("betteru_notif_inapp", e.target.checked);
                }}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">{notifInapp ? "On" : "Off"}</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">Push notifications <span className="text-xs text-slate-500">(Coming soon)</span></div>
              <p className="text-xs text-slate-600">Preference-only for now; no backend wiring yet.</p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifPush}
                onChange={(e) => {
                  setNotifPush(e.target.checked);
                  persist("betteru_notif_push", e.target.checked);
                }}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">{notifPush ? "On" : "Off"}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-2">
        <h2 className="font-semibold text-lg">Security</h2>
        <p className="text-sm text-slate-600">Diary lock / PIN settings coming soon.</p>
      </div>
    </>
  );
}
