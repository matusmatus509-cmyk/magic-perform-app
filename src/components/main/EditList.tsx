"use client";

import { useState, useEffect, useCallback } from "react";
import type { MagicListItem } from "@/db/schema";

interface EditListProps {
  onBack: () => void;
}

export default function EditList({ onBack }: EditListProps) {
  const [items, setItems] = useState<MagicListItem[]>([]);
  const [draft, setDraft] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/magic-list");
      if (res.ok) {
        const data = (await res.json()) as MagicListItem[];
        setItems(data);
        setDraft(data.map((i) => i.label));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleaned = draft
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await fetch("/api/magic-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleaned }),
      });
      await fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => setDraft((d) => [...d, ""]);
  const handleRemove = (i: number) =>
    setDraft((d) => d.filter((_, idx) => idx !== i));
  const handleChange = (i: number, v: string) =>
    setDraft((d) => d.map((x, idx) => (idx === i ? v : x)));

  const handleApplyImport = () => {
    const lines = importText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setDraft((d) => [...d, ...lines]);
    setImportText("");
    setImportOpen(false);
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
        <h1 className="text-white font-semibold text-lg">Edit List</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-blue-400 text-sm font-semibold"
        >
          {saving ? "Saving" : "Save"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-2">
        {loading ? (
          <div className="text-gray-500 text-sm text-center py-10">Loading...</div>
        ) : draft.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-10">
            No items yet. Add or import.
          </div>
        ) : (
          draft.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-500 w-7 text-right text-xs">
                {i + 1}
              </span>
              <input
                value={label}
                onChange={(e) => handleChange(i, e.target.value)}
                className="flex-1 px-3 py-3 rounded-xl text-white text-sm"
                style={{ background: "#1c1c1e" }}
              />
              <button
                onClick={() => handleRemove(i)}
                className="text-red-400 text-sm px-2"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setImportOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "#1c1c1e" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 text-white font-semibold border-b border-white/10">
              Import list (one item per line)
            </div>
            <textarea
              autoFocus
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 text-white text-sm bg-transparent"
              placeholder={"Item one\nItem two\nItem three"}
            />
            <div className="flex border-t border-white/10">
              <button
                className="flex-1 py-3 text-blue-400 font-semibold"
                onClick={() => setImportOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 text-blue-400 font-semibold border-l border-white/10"
                onClick={handleApplyImport}
              >
                Add lines
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-5 flex flex-col gap-3 z-30">
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center justify-center rounded-full shadow-2xl"
          style={{ width: 48, height: 48, background: "#2c2c2e" }}
          title="Import"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center rounded-full shadow-2xl"
          style={{ width: 56, height: 56, background: "#2c2c2e", border: "1px solid #3a3a3c" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {items.length > 0 && (
        <p className="text-center text-gray-600 text-xs pb-4">
          {items.length} saved items
        </p>
      )}
    </div>
  );
}
