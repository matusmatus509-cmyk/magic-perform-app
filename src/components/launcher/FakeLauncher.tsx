"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import LauncherPage from "@/components/launcher/LauncherPage";
import { buildIconPages } from "@/components/launcher/launcherConfig";
import type { MagicSettings } from "@/db/schema";
import { buildCells, pointToCell, digitsToPosition, type GridCell, type BBox } from "@/lib/grid";

interface FakeLauncherProps {
  settings: MagicSettings;
  onComplete: (position: number) => void;
}

const DRAG_THRESHOLD = 28; // min px to be treated as a swipe-digit
const PAGE_FLING_THRESHOLD = 90; // horizontal px to change page

export default function FakeLauncher({ settings, onComplete }: FakeLauncherProps) {
  const pageCount = settings.pagecount;
  const rows = settings.gridRows;
  const cols = settings.gridCols;

  const pages = buildIconPages(pageCount, rows, cols, settings.launcherLabel);

  const [pageIndex, setPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [wallpaper, setWallpaper] = useState(settings.wallpaperColor);

  const digitsRef = useRef<GridCell[]>([]);
  const pageAreaRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
    captured: boolean;
  }>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false, captured: false });

  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setWallpaper(settings.wallpaperColor);
  }, [settings.wallpaperColor]);

  const computeCells = useCallback((): BBox => {
    const el = pageAreaRef.current;
    if (!el) return { left: 0, top: 0, width: 0, height: 0 };
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (transitioning) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: true,
      captured: false,
    };
  }, [transitioning]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    dragRef.current.currentX = e.clientX;
    dragRef.current.currentY = e.clientY;
  }, []);

  const finalizeDigit = useCallback(
    (releaseX: number, releaseY: number) => {
      const cells = buildCells(computeCells());
      const d = pointToCell(releaseX, releaseY, cells);
      digitsRef.current.push(d);
      setFlash(true);
      setTimeout(() => setFlash(false), 120);
    },
    [computeCells]
  );

  const goToNextPage = useCallback(() => {
    setTransitioning(true);
    setPageIndex((p) => Math.min(p + 1, pageCount - 1));
    setTimeout(() => setTransitioning(false), 320);
  }, [pageCount]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return;
      const { startX, startY, currentX, currentY } = dragRef.current;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const dist = Math.hypot(dx, dy);
      dragRef.current.active = false;

      if (absDx > absDy && absDx >= PAGE_FLING_THRESHOLD) {
        if (dx < 0 && pageIndex < pageCount - 1) {
          finalizeDigit(-1, -1);
          digitsRef.current.pop();
          goToNextPage();
        } else if (dx > 0 && pageIndex > 0) {
          return;
        }
        return;
      }

      if (dist < DRAG_THRESHOLD) {
        return;
      }

      finalizeDigit(e.clientX, e.clientY);

      if (pageIndex < pageCount - 1) {
        setTimeout(() => goToNextPage(), 80);
      } else {
        const d1 = digitsRef.current[0] ?? 0;
        const d2 = digitsRef.current[1] ?? 0;
        const position = digitsToPosition(d1, d2);
        setTimeout(() => onComplete(position), 250);
      }
    },
    [pageIndex, pageCount, finalizeDigit, goToNextPage, onComplete]
  );

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${wallpaper} 0%, #000 100%)`,
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="flex-1 pt-10 px-6">
        <div
          ref={pageAreaRef}
          className="relative w-full"
          style={{
            height: "calc(100vh - 160px)",
            transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)",
            transform: `translateX(-${pageIndex * 100}%)`,
          }}
        >
          <div className="flex h-full" style={{ width: `${pageCount * 100}%` }}>
            {pages.map((icons, i) => (
              <div
                key={i}
                className="h-full flex items-center justify-center"
                style={{ width: `${100 / pageCount}%` }}
              >
                <div style={{ width: "100%", height: "100%" }}>
                  <LauncherPage icons={icons} rows={rows} cols={cols} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-10">
        {Array.from({ length: pageCount }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: i === pageIndex ? "#ffffff" : "rgba(255,255,255,0.35)",
              transition: "background 200ms",
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center pb-6">
        <button className="flex items-center justify-center rounded-full bg-white/10 px-8 py-2.5 text-white text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {flash && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(255,255,255,0.04)" }} />
      )}
    </div>
  );
}
