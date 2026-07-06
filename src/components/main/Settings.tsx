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
  const [listNames, setListNames] = useState<string[]>(["default"]);
  const [newListName, setNewListName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [setRes, listsRes] = await Promise.all([
        fetch("/api/magic-settings"),
        fetch("/api/magic-lists"),
      ]);
      if (setRes.ok) {
        const s = await setRes.json();
        if (s) setSettings(s);
      }
      if (listsRes.ok) {
        const names = await listsRes.json();
        setListNames(names.length ? names : ["default"]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

  const handleSwitchList = (name: string) => {
    setSettings({ ...settings, currentList: name });
    handleSave({ currentList: name });
  };

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name || listNames.includes(name)) {
      setNewListName("");
      return;
    }
    try {
      await fetch("/api/magic-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listName: name, items: [] }),
      });
      setListNames([...listNames, name]);
      setNewListName("");
      handleSwitchList(name);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteList = async (name: string) => {
    if (name === "default") return;
    try {
      await fetch(`/api/magic-list?list=${encodeURIComponent(name)}`, { method: "DELETE" });
      setListNames(listNames.filter((n) => n !== name));
      if (settings.currentList === name) {
        handleSwitchList("default");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatOptions = [
    { value: "numbered", label: "1. Polozka\n2. Polozka\n..." },
    { value: "plain", label: "Polozka\nPolozka\n..." },
    { value: "bullet", label: "\u2022 Polozka\n\u2022 Polozka\n..." },
  ];

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

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-6 pb-24">
        {/* ===== LISTS ===== */}
        <div>
          <p className="text-gray-400 text-xs mb-2">Active list for Perform</p>
          <div className="space-y-1 mb-2">
            {listNames.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer"
                style={{
                  background: name === settings.currentList ? "#1c2a4a" : "#1c1c1e",
                }}
                onClick={() => handleSwitchList(name)}
              >
                <span className="text-white text-sm">{name}</span>
                {name !== "default" && (
                  <button
                    className="text-red-400 text-xs px-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(name);
                    }}
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name"
              className="flex-1 px-3 py-2 rounded-xl text-white text-sm"
              style={{ background: "#1c1c1e" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
              }}
            />
            <button
              onClick={handleCreateList}
              className="px-4 py-2 rounded-xl text-blue-400 text-sm font-semibold"
              style={{ background: "#2c2c2e" }}
            >
              Create
            </button>
          </div>
        </div>

        {/* ===== NOTE TITLE ===== */}
        <div>
          <p className="text-gray-400 text-xs mb-2">
            Note title template (leave empty = force item name)
          </p>
          <input
            value={settings.noteTitleTemplate}
            onChange={(e) =>
              setSettings({ ...settings, noteTitleTemplate: e.target.value })
            }
            onBlur={() => handleSave({ noteTitleTemplate: settings.noteTitleTemplate })}
            placeholder={"{{forceItem}}"}
            className="w-full px-3 py-3 rounded-xl text-white text-sm"
            style={{ background: "#1c1c1e" }}
          />
          <p className="text-gray-600 text-xs mt-1">
            Empty = force item label
          </p>
        </div>

        {/* ===== NOTE CONTENT FORMAT ===== */}
        <div>
          <p className="text-gray-400 text-xs mb-2">Note content format</p>
          <div className="space-y-1">
            {formatOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSave({ noteContentFormat: opt.value })}
                className="w-full text-left px-3 py-2 rounded-xl text-white text-sm flex items-center justify-between"
                style={{
                  background:
                    settings.noteContentFormat === opt.value ? "#1c2a4a" : "#1c1c1e",
                }}
              >
                <span>{opt.label}</span>
                {settings.noteContentFormat === opt.value && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ===== LAUNCHER LABEL ===== */}
        <div>
          <p className="text-gray-400 text-xs mb-2">Launcher icon label</p>
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

        {/* ===== WALLPAPER ===== */}
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

        {/* ===== GRID ===== */}
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
          Hidden 3×3 swipe grid: out-of-grid release = 0.
          {saving ? " Saving..." : ""}
        </p>
      </div>

      {/* Delete list confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: "#2c2c2e" }}
          >
            <div className="p-5 text-center">
              <p className="text-white font-semibold">
                Delete list &quot;{deleteConfirm}&quot;?
              </p>
              <p className="text-gray-400 text-sm mt-1">
                All items in this list will be lost.
              </p>
            </div>
            <div style={{ height: 1, background: "#3a3a3c" }} />
            <button
              className="w-full py-4 text-red-400 font-semibold"
              onClick={() => handleDeleteList(deleteConfirm)}
            >
              Delete
            </button>
            <div style={{ height: 1, background: "#3a3a3c" }} />
            <button
              className="w-full py-4 text-blue-400"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}