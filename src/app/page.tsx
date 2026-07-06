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
      const s = await setRes.json();
      if (!s?.forceItemId) {
        setStage("notes");
        return;
      }
      await fetch("/api/magic-list/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: s.forceItemId, targetPosition: position }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setStage("notes");
    }
  }, []);

  if (stage === "perform") {
    return <FakeLauncher settings={settings} onComplete={handleComplete} />;
  }

  if (stage === "notes") {
    return <NotesScreen />;
  }

  if (stage === "edit") {
    return <EditList onBack={() => setStage("menu")} />;
  }

  if (stage === "select") {
    return <SelectForceItem onBack={() => setStage("menu")} />;
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
