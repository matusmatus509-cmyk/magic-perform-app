"use client";

import { useState, useEffect, useCallback } from "react";
import type { MagicListItem, MagicSettings } from "@/db/schema";

interface SelectForceItemProps {
  onBack: () => void;
}

export default function SelectForceItem({ onBack }: SelectForceItemProps) {
  const [items, setItems] = useState<MagicListItem[]>([]);
  const [settings, setSettings] = useState<MagicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, setRes] = await Promise.all([
        fetch("/api/magic-list"),
        fetch("/api/magic-settings"),
      ]);
      if (listRes.ok) setItems(await listRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        setSettings(s);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handlePick = async (itemId: number) => {
    try {
      await fetch("/api/magic-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceItemId: itemId }),
      });
      await fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  const selectedId = settings?.forceItemId ?? null;

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
        <h1 className="text-white font-semibold text-lg">Select Force Item</h1>
        <span className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-3">
        {loading ? (
          <div className="text-gray-500 text-sm text-center py-10">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-10">
            No items yet. Edit the list first.
          </div>
        ) : (
          <ul>
            {items.map((item) => {
              const active = item.id === selectedId;
              return (
                <li
                  key={item.id}
                  onClick={() => handlePick(item.id)}
                  className="flex items-center justify-between px-4 py-4 cursor-pointer"
                  style={{
                    background: active ? "#1c2a4a" : "transparent",
                    borderBottom: "1px solid #1c1c1e",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs w-7 text-right">
                      {item.position + 1}
                    </span>
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                  {active && (
                    <span className="text-blue-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
