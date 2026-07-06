"use client";

import { useState, useEffect, useCallback } from "react";
import type { MagicListItem, MagicSettings } from "@/db/schema";
import { defaultSettings } from "@/components/launcher/launcherConfig";

interface MainMenuProps {
  onPerform: () => void;
  onEditList: () => void;
  onSelectForce: () => void;
  onSettings: () => void;
}

export default function MainMenu({
  onPerform,
  onEditList,
  onSelectForce,
  onSettings,
}: MainMenuProps) {
  const [items, setItems] = useState<MagicListItem[]>([]);
  const [settings, setSettings] = useState<MagicSettings>(defaultSettings);

  const refresh = useCallback(async () => {
    try {
      const [listRes, setRes] = await Promise.all([
        fetch("/api/magic-list"),
        fetch("/api/magic-settings"),
      ]);
      if (listRes.ok) setItems(await listRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        if (s) setSettings(s);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const forceItem = items.find((i) => i.id === settings.forceItemId);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
      <div className="pt-16 px-6 pb-6">
        <h1 className="text-white font-bold text-3xl">Magic Perform</h1>
        <p className="text-gray-400 text-sm mt-1">
          Edit list • choose force item • perform
        </p>
      </div>

      <div className="flex-1 px-6 space-y-4">
        <button
          onClick={onPerform}
          className="w-full py-5 rounded-2xl text-white font-semibold text-lg flex items-center justify-between px-6"
          style={{ background: "#1c1c1e" }}
        >
          <span>Perform</span>
          <span className="text-blue-400">{">"}</span>
        </button>

        <button
          onClick={onEditList}
          className="w-full py-5 rounded-2xl text-white font-semibold text-base flex items-center justify-between px-6"
          style={{ background: "#1c1c1e" }}
        >
          <span>Edit List</span>
          <span className="text-gray-500 text-sm">
            {items.length} items {">"}
          </span>
        </button>

        <button
          onClick={onSelectForce}
          className="w-full py-5 rounded-2xl text-white font-semibold text-base flex items-center justify-between px-6"
          style={{ background: "#1c1c1e" }}
        >
          <span>Select Force Item</span>
          <span className="text-gray-500 text-sm truncate ml-3 max-w-[55%] text-right">
            {forceItem ? forceItem.label : "Not set"} {">"}
          </span>
        </button>

        <button
          onClick={onSettings}
          className="w-full py-5 rounded-2xl text-white font-semibold text-base flex items-center justify-between px-6"
          style={{ background: "#1c1c1e" }}
        >
          <span>Settings</span>
          <span className="text-gray-500">{">"}</span>
        </button>
      </div>

      <div className="px-6 pb-10 pt-6">
        <p className="text-gray-600 text-xs text-center">
          Final stage: Notes screen (unchanged)
        </p>
      </div>
    </div>
  );
}
