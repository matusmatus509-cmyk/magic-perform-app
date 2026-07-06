"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";

export interface Note {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotesScreenProps {
  targetNoteId?: number | null;
  onExitNotes?: () => void;
}

export default function NotesScreen({ targetNoteId, onExitNotes }: NotesScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openedRef = useRef<number | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        return data as Note[];
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!cancelled) void fetchNotes();
    return () => {
      cancelled = true;
    };
  }, [fetchNotes]);

  useEffect(() => {
    if (!targetNoteId || openedRef.current === targetNoteId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notes/${targetNoteId}`);
        if (res.ok && !cancelled) {
          const note = await res.json();
          if (note) {
            setSelectedNote(note);
            setIsEditorOpen(true);
            openedRef.current = targetNoteId;
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetNoteId]);

  const handleNewNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", content: "" }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNote(newNote);
        setIsEditorOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (id: number, title: string, content: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        setSelectedNote(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setIsEditorOpen(false);
      setSelectedNote(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinNote = async (id: number, pinned: boolean) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    openedRef.current = null;
    if (onExitNotes) {
      onExitNotes();
    } else {
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {isEditorOpen && selectedNote ? (
        <NoteEditor
          note={selectedNote}
          onClose={handleCloseEditor}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      ) : (
        <NotesList
          notes={filteredNotes}
          loading={loading}
          searchQuery={searchQuery}
          isSearchOpen={isSearchOpen}
          onSearchOpen={() => setIsSearchOpen(true)}
          onSearchClose={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
          onSearchChange={setSearchQuery}
          onNewNote={handleNewNote}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDeleteNote}
          onPinNote={handlePinNote}
        />
      )}
    </div>
  );
}