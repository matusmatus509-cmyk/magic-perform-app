"use client";

import { useState, useCallback, useEffect } from "react";
import MainMenu from "@/components/main/MainMenu";
import EditList from "@/components/main/EditList";
import SelectForceItem from "@/components/main/SelectForceItem";
import Settings from "@/components/main/Settings";
import FakeLauncher from "@/components/launcher/FakeLauncher";
import NotesScreen from "@/components/NotesScreen";
import { defaultSettings } from "@/components/launcher/launcherConfig";
import type { MagicSettings } from "@/db/schema";

type Stage = "menu" | "edit" | "select" | "settings" | "perform" | "notes";

export default function Home() {
  const [stage, setStage] = useState<Stage>("menu");
  const [settings, setSettings] = useState<MagicSettings>(defaultSettings);
  const [targetNoteId, setTargetNoteId] = useState<number | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/magic-settings");
      if (res.ok) {
        const s = await res.json();
        if (s) setSettings(s);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handlePerform = useCallback(() => {
    fetchSettings();
    setStage("perform");
  }, [fetchSettings]);

  const handleComplete = useCallback(async (position: number) => {
    try {
      const setRes = await fetch("/api/magic-settings");
      if (!setRes.ok) return;
      const s: MagicSettings = await setRes.json();
      if (!s?.forceItemId) {
        setStage("notes");
        return;
      }

      const listName = s.currentList ?? "default";

      await fetch("/api/magic-list/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: s.forceItemId,
          targetPosition: position,
          listName,
        }),
      });

      const listRes = await fetch(`/api/magic-list?list=${encodeURIComponent(listName)}`);
      if (!listRes.ok) return;
      const list: { label: string; position: number }[] = await listRes.json();

      // Delete all previous notes so only the current perform note appears
      const existingNotesRes = await fetch("/api/notes");
      if (existingNotesRes.ok) {
        const existingNotes: { id: number }[] = await existingNotesRes.json();
        await Promise.all(
          existingNotes.map((n) =>
            fetch(`/api/notes/${n.id}`, { method: "DELETE" })
          )
        );
      }

      // Build content using format
      const format = s.noteContentFormat ?? "numbered";
      const lines = list.map((item) => {
        const idx = item.position + 1;
        if (format === "bullets" || format === "bullet") return `\u2022 ${item.label}`;
        if (format === "plain") return item.label;
        return `${idx}. ${item.label}`;
      });
      const content = lines.join("\n");

      const forceItem = list.find((item) => item.position === position);
      const title =
        (s.noteTitleTemplate?.trim() || forceItem?.label) ?? forceItem?.label ?? "Zoznam";

      const noteRes = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (noteRes.ok) {
        const note = await noteRes.json();
        setTargetNoteId(note.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStage("notes");
    }
  }, []);

  const handleExitNotes = useCallback(() => {
    setTargetNoteId(null);
    setStage("menu");
  }, []);

  if (stage === "perform") {
    return <FakeLauncher settings={settings} onComplete={handleComplete} />;
  }

  if (stage === "notes") {
    return (
      <NotesScreen
        targetNoteId={targetNoteId}
        onExitNotes={handleExitNotes}
      />
    );
  }

  if (stage === "edit") {
    return (
      <EditList
        onBack={() => setStage("menu")}
        currentList={settings.currentList ?? "default"}
      />
    );
  }

  if (stage === "select") {
    return (
      <SelectForceItem
        onBack={() => setStage("menu")}
        currentList={settings.currentList ?? "default"}
      />
    );
  }

  if (stage === "settings") {
    return <Settings onBack={() => setStage("menu")} />;
  }

  return (
    <MainMenu
      onPerform={handlePerform}
      onEditList={() => setStage("edit")}
      onSelectForce={() => setStage("select")}
      onSettings={() => setStage("settings")}
    />
  );
}