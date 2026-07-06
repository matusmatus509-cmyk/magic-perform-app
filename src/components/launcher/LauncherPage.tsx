"use client";

import type { LauncherIconDef } from "@/components/launcher/launcherConfig";

export default function LauncherPage({
  icons,
  rows,
  cols,
}: {
  icons: LauncherIconDef[];
  rows: number;
  cols: number;
}) {
  return (
    <div
      className="grid gap-x-4 gap-y-6"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {icons.map((icon, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center select-none"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: icon.color,
              boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
            }}
          >
            <span style={{ fontSize: 26, color: "#fff" }}>{icon.glyph}</span>
          </div>
          <p className="mt-1.5 text-white text-xs text-center truncate max-w-[72px]">
            {icon.label}
          </p>
        </div>
      ))}
    </div>
  );
}
