"use client";

import type { MagicSettings } from "@/db/schema";

export interface LauncherIconDef {
  label: string;
  glyph: string;
  color: string;
}

export const DEFAULT_ICONS: LauncherIconDef[] = [
  { label: "Phone", glyph: "\u260E", color: "#21c261" },
  { label: "Messages", glyph: "\u2709", color: "#1ec4ff" },
  { label: "Contacts", glyph: "\u263B", color: "#ff8a3d" },
  { label: "Camera", glyph: "\u25A0", color: "#ffd23f" },
  { label: "Gallery", glyph: "\u25C6", color: "#ff5b8a" },
  { label: "Browser", glyph: "\u25EF", color: "#3e8eff" },
  { label: "Maps", glyph: "\u269B", color: "#5be26e" },
  { label: "Clock", glyph: "\u25E2", color: "#c9a3ff" },
  { label: "Calendar", glyph: "\u25A3", color: "#ff5b5b" },
  { label: "Settings", glyph: "\u2699", color: "#9aa0a6" },
  { label: "Notes", glyph: "\u270E", color: "#ffb000" },
  { label: "Mail", glyph: "\u2702", color: "#3e8eff" },
  { label: "Calculator", glyph: "\u2261", color: "#ff8a3d" },
  { label: "Files", glyph: "\u25A4", color: "#9aa0a6" },
  { label: "Store", glyph: "\u25B2", color: "#5be26e" },
  { label: "Weather", glyph: "\u2600", color: "#1ec4ff" },
  { label: "Music", glyph: "\u266B", color: "#ff5b8a" },
  { label: "Calendar2", glyph: "\u25B3", color: "#ffd23f" },
  { label: "Health", glyph: "\u2665", color: "#ff5b5b" },
  { label: "Wallet", glyph: "\u25C9", color: "#21c261" },
];

export function buildIconPages(
  pageCount: number,
  rows: number,
  cols: number,
  launcherLabel: string
): LauncherIconDef[][] {
  const perPage = rows * cols;
  const pages: LauncherIconDef[][] = [];
  let cursor = 0;
  for (let p = 0; p < pageCount; p++) {
    const slice = DEFAULT_ICONS.slice(cursor, cursor + perPage);
    if (slice.length < perPage) {
      while (slice.length < perPage) {
        slice.push({ label: "Folder", glyph: "\u25A2", color: "#3a3a3c" });
      }
    }
    if (p === pageCount - 1) {
      const notesIdx = Math.min(slice.length - 1, 3);
      slice[notesIdx] = { label: launcherLabel, glyph: "\u270E", color: "#ffb000" };
    }
    pages.push(slice);
    cursor += perPage;
  }
  return pages;
}

export const defaultSettings = {
  id: 0,
  forceItemId: null as number | null,
  currentList: "default",
  wallpaperColor: "#0b1f3a",
  launcherLabel: "Notes",
  gridRows: 5,
  gridCols: 4,
  pagecount: 3,
  noteTitleTemplate: "",
  noteContentFormat: "numbered" as const,
  updatedAt: new Date(0),
} as MagicSettings;
