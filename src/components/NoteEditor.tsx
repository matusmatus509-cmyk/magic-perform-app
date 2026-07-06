"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Note } from "@/components/NotesScreen";

interface NoteEditorProps {
  note: Note;
  onClose: () => void;
  onSave: (id: number, title: string, content: string) => void;
  onDelete: (id: number) => void;
}

type Tool = "keyboard" | "pen" | "marker" | "eraser" | "lasso" | "ai";

export default function NoteEditor({ note, onClose, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [activeTool, setActiveTool] = useState<Tool>("keyboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  const debouncedSave = useCallback(
    (newTitle: string, newContent: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        onSave(note.id, newTitle, newContent);
      }, 800);
    },
    [note.id, onSave]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    debouncedSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    debouncedSave(title, val);
  };

  const handleClose = () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      onSave(note.id, title, content);
    }
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(note.id);
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    {
      id: "keyboard",
      label: "Klávesnica",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <line x1="6" y1="10" x2="6" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="10" x2="10" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="10" x2="14" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="10" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="14" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="14" x2="10" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="14" x2="14" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="17" x2="16" y2="17" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="14" x2="18" y2="14" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "pen",
      label: "Pero",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 5l4 4" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "marker",
      label: "Zvýrazňovač",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 19.5L5 12.5 14.5 3l7 7L12 19.5z" stroke="#b8860b" strokeWidth="1.8" fill="#b8860b" fillOpacity="0.3" strokeLinejoin="round" />
          <path d="M5 12.5L3 21l8.5-2L5 12.5z" stroke="#b8860b" strokeWidth="1.5" fill="#b8860b" fillOpacity="0.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "eraser",
      label: "Guma",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5" />
          <line x1="6.5" y1="17.5" x2="13" y2="11" />
        </svg>
      ),
    },
    {
      id: "lasso",
      label: "Laso",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2">
          <ellipse cx="12" cy="12" rx="9" ry="7" />
        </svg>
      ),
    },
    {
      id: "ai",
      label: "AI",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" stroke="#c8a8ff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5 5L4 7l2-1L5 5z" stroke="#c8a8ff" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M19 17l-1 2 2-1-1-1z" stroke="#c8a8ff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#000" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 pt-12 pb-2"
        style={{ background: "#000", borderBottom: "1px solid #1c1c1e" }}
      >
        <button
          className="flex items-center gap-1 text-gray-400 active:opacity-60"
          onClick={handleClose}
        >
          <svg width="10" height="16" viewBox="0 0 10 18" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
        </button>

        {/* Title input */}
        <input
          className="flex-1 mx-3 text-white text-base font-medium text-center placeholder-gray-600 bg-transparent"
          placeholder="Názov"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />

        <div className="flex items-center gap-3">
          {/* Book view icon */}
          <button className="p-1 active:opacity-60">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round">
              <rect x="1" y="1" width="10" height="18" rx="1.5" />
              <rect x="13" y="1" width="10" height="18" rx="1.5" />
            </svg>
          </button>

          {/* Add item icon */}
          <button className="p-1 active:opacity-60">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* More menu */}
          <button className="p-1 active:opacity-60 relative" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2">
              <circle cx="5" cy="12" r="1.5" fill="#8e8e93" />
              <circle cx="12" cy="12" r="1.5" fill="#8e8e93" />
              <circle cx="19" cy="12" r="1.5" fill="#8e8e93" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-4 top-24 z-50 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#2c2c2e", minWidth: 200 }}
          >
            {[
              { label: "Zdieľať", icon: "↗️" },
              { label: "Exportovať ako PDF", icon: "📄" },
              { label: "Pripnúť", icon: "📌" },
              { label: "Presunúť do koša", icon: "🗑️", danger: true },
            ].map((item, i) => (
              <div key={item.label}>
                {i > 0 && <div style={{ height: 1, background: "#3a3a3c" }} />}
                <button
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/10 ${item.danger ? "text-red-400" : "text-white"}`}
                  onClick={() => {
                    if (item.danger) {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    } else {
                      setMenuOpen(false);
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toolbar */}
      <div
        className="flex items-center justify-around px-2 py-2"
        style={{ background: "#1c1c1e" }}
      >
        {tools.map((tool) => (
          <button
            key={tool.id}
            className="flex items-center justify-center rounded-xl transition-colors active:scale-95"
            style={{
              width: 44,
              height: 44,
              background: activeTool === tool.id ? "#3a3a3c" : "transparent",
            }}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
        {/* Undo */}
        <button
          className="flex items-center justify-center rounded-xl active:scale-95"
          style={{ width: 44, height: 44 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 p-5">
        <textarea
          className="w-full h-full text-white text-base leading-7 bg-transparent placeholder-gray-600"
          placeholder="Začnite písať..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          style={{ minHeight: "calc(100vh - 250px)" }}
          autoFocus={activeTool === "keyboard"}
          readOnly={activeTool !== "keyboard"}
        />
      </div>

      {/* Page indicator */}
      <div className="flex items-center justify-end px-4 py-2">
        <span className="text-gray-600 text-xs">1/1</span>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#2c2c2e" }}>
            <div className="p-5 text-center">
              <p className="text-white font-semibold text-base">Vymazať poznámku?</p>
              <p className="text-gray-400 text-sm mt-1">Táto akcia sa nedá vrátiť.</p>
            </div>
            <div style={{ height: 1, background: "#3a3a3c" }} />
            <button
              className="w-full py-4 text-red-400 font-semibold text-base"
              onClick={handleDelete}
            >
              Vymazať
            </button>
            <div style={{ height: 1, background: "#3a3a3c" }} />
            <button
              className="w-full py-4 text-blue-400 text-base"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Zrušiť
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
