"use client";

import { useState } from "react";
import type { Note } from "@/components/NotesScreen";

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (q: string) => void;
  onNewNote: () => void;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
  onPinNote: (id: number, pinned: boolean) => void;
}

function groupNotesByMonth(notes: Note[]) {
  const groups: Record<string, Note[]> = {};
  notes.forEach((note) => {
    const date = new Date(note.updatedAt);
    const key = date.toLocaleString("sk-SK", { month: "long" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(note);
  });
  return groups;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}. ${month}.`;
}

function NoteCard({
  note,
  onSelect,
  onDelete,
  onPin,
}: {
  note: Note;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const title = note.title || note.content.split("\n")[0] || "Bez názvu";
  const preview = note.content.substring(0, 120);

  return (
    <div className="relative flex flex-col">
      <div
        className="rounded-2xl p-4 cursor-pointer select-none"
        style={{ background: "#1c1c1e", minHeight: 140 }}
        onClick={onSelect}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
      >
        <p className="text-white text-sm leading-relaxed line-clamp-5 whitespace-pre-wrap">
          {preview || <span className="text-gray-500">Prázdna poznámka</span>}
        </p>
      </div>

      <div className="mt-2 px-1">
        <p className="text-white font-semibold text-sm leading-tight truncate">
          {title}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">{formatDate(note.updatedAt)}</p>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-0 left-0 z-50 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: "#2c2c2e", minWidth: 180 }}
          >
            <button
              className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/10 flex items-center gap-3"
              onClick={(e) => { e.stopPropagation(); onPin(); setMenuOpen(false); }}
            >
              <span>📌</span>
              {note.pinned ? "Odopnúť" : "Pripnúť"}
            </button>
            <div style={{ height: 1, background: "#3a3a3c" }} />
            <button
              className="w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-white/10 flex items-center gap-3"
              onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
            >
              <span>🗑️</span>
              Vymazať
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function NotesList({
  notes,
  loading,
  searchQuery,
  isSearchOpen,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  onNewNote,
  onSelectNote,
  onDeleteNote,
  onPinNote,
}: NotesListProps) {
  const groups = groupNotesByMonth(notes);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#000" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 pt-12 pb-3"
        style={{ background: "#000" }}
      >
        {isSearchOpen ? (
          <div className="flex items-center gap-2 w-full">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "#1c1c1e" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500"
                placeholder="Hľadať poznámky"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <button
              className="text-blue-400 text-sm px-1"
              onClick={onSearchClose}
            >
              Zrušiť
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button className="p-1">
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                  <rect width="22" height="2.5" rx="1.25" fill="#8e8e93" />
                  <rect y="7.75" width="22" height="2.5" rx="1.25" fill="#8e8e93" />
                  <rect y="15.5" width="22" height="2.5" rx="1.25" fill="#8e8e93" />
                </svg>
              </button>
              <h1 className="text-white font-bold text-2xl">Všetky poznámky</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* PDF icon */}
              <button className="p-1">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="3" y="3" width="22" height="22" rx="4" stroke="#8e8e93" strokeWidth="1.8" />
                  <text x="7" y="19" fontSize="9" fill="#8e8e93" fontWeight="bold">PDF</text>
                </svg>
              </button>
              <button className="p-1" onClick={onSearchOpen}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <button className="p-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1.5" fill="#8e8e93" /><circle cx="12" cy="12" r="1.5" fill="#8e8e93" /><circle cx="12" cy="19" r="1.5" fill="#8e8e93" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500 text-sm">Načítavam...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">📝</div>
            <p className="text-gray-500 text-base">
              {searchQuery ? "Žiadne výsledky" : "Žiadne poznámky"}
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([month, groupNotes]) => (
            <div key={month} className="mb-6">
              <h2 className="text-white font-semibold text-base mb-3 capitalize">
                {month}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {groupNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onSelect={() => onSelectNote(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onPin={() => onPinNote(note.id, !note.pinned)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB - New note button */}
      <div className="fixed bottom-8 right-5 z-30">
        <button
          onClick={onNewNote}
          className="flex items-center justify-center rounded-full shadow-2xl active:scale-95 transition-transform"
          style={{
            width: 60,
            height: 60,
            background: "#2c2c2e",
            border: "1px solid #3a3a3c",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
