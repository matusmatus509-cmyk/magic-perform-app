"use client";

import { useState, useEffect, useCallback } from "react";
import type { MagicSettings } from "@/db/schema";
import { defaultSettings } from "@/components/launcher/launcherConfig";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [settings, setSettings] = useState<MagicSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/magic-settings");
      if (res.ok) {
        const s = await res.json();
        if (s) setSettings(s);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (patch: Partial<MagicSettings>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/magic-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) setSettings(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
      <div
        className="flex items-center justify-between px-4 pt-12 pb-3"
        style={{ borderBottom: "1px solid #1c1c1e" }}
      >
        <button
          className="flex items-center gap-1 text-blue-400"
          onClick={onBack}
        >
          <svg width="10" height="16" viewBox="0 0 10 18" fill="none" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Back
        </button>
        <h1 className="text-white font-semibold text-lg">Settings</h1>
        <span className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-6 pb-12">
        <div>
          <p className="text-gray-400 text-xs mb-2">Launcher label (final-page Notes icon)</p>
          <input
            value={settings.launcherLabel}
            onChange={(e) =>
              setSettings({ ...settings, launcherLabel: e.target.value })
            }
            onBlur={() => handleSave({ launcherLabel: settings.launcherLabel })}
            className="w-full px-3 py-3 rounded-xl text-white text-sm"
            style={{ background: "#1c1c1e" }}
          />
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-2">Wallpaper (hex)</p>
          <div className="flex items-center gap-3">
            <input
              value={settings.wallpaperColor}
              onChange={(e) =>
                setSettings({ ...settings, wallpaperColor: e.target.value })
              }
              onBlur={() => handleSave({ wallpaperColor: settings.wallpaperColor })}
              className="flex-1 px-3 py-3 rounded-xl text-white text-sm"
              style={{ background: "#1c1c1e" }}
            />
            <span
              className="rounded-xl"
              style={{
                width: 40,
                height: 40,
                background: settings.wallpaperColor,
                border: "1px solid #3a3a3c",
              }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-gray-400 text-xs mb-2">Grid rows</p>
            <input
              type="number"
              min={3}
              max={6}
              value={settings.gridRows}
              onChange={(e) =>
                setSettings({ ...settings, gridRows: Number(e.target.value) })
              }
              onBlur={() => handleSave({ gridRows: settings.gridRows })}
              className="w-full px-3 py-3 rounded-xl text-white text-sm"
              style={{ background: "#1c1c1e" }}
            />
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs mb-2">Grid cols</p>
            <input
              type="number"
              min={3}
              max={6}
              value={settings.gridCols}
              onChange={(e) =>
                setSettings({ ...settings, gridCols: Number(e.target.value) })
              }
              onBlur={() => handleSave({ gridCols: settings.gridCols })}
              className="w-full px-3 py-3 rounded-xl text-white text-sm"
              style={{ background: "#1c1c1e" }}
            />
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-xs mb-2">Pages</p>
            <input
              type="number"
              min={1}
              max={5}
              value={settings.pagecount}
              onChange={(e) =>
                setSettings({ ...settings, pagecount: Number(e.target.value) })
              }
              onBlur={() => handleSave({ pagecount: settings.pagecount })}
              className="w-full px-3 py-3 rounded-xl text-white text-sm"
              style={{ background: "#1c1c1e" }}
            />
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          The hidden 3×3 swipe grid overlays each page. Out-of-grid release = 0.
          {saving ? " Saving..." : ""}
        </p>
      </div>
    </div>
  );
}
