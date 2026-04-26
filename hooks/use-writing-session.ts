"use client";

import { useEffect, useRef, useCallback } from "react";

export function useWritingSession(wordCount: number) {
  const sessionStart = useRef<number>(Date.now());
  const lastSyncedWords = useRef<number>(wordCount);
  const lastSyncedTime = useRef<number>(Date.now());

  const sync = useCallback(async (words: number) => {
    const now = Date.now();
    const duration = Math.round((now - lastSyncedTime.current) / 1000);
    lastSyncedTime.current = now;
    lastSyncedWords.current = words;

    try {
      await fetch("/api/writing-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordCount: words, duration }),
      });
    } catch {
      // Silent — session tracking is best-effort
    }
  }, []);

  // Sync every 60 seconds while writing
  useEffect(() => {
    const interval = setInterval(() => {
      if (wordCount !== lastSyncedWords.current) {
        sync(wordCount);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [wordCount, sync]);

  // Sync on unmount (tab close / navigation)
  useEffect(() => {
    return () => {
      if (wordCount > 0) sync(wordCount);
    };
  }, [wordCount, sync]);

  // Sync on visibility change (switching tabs)
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && wordCount > 0) sync(wordCount);
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [wordCount, sync]);
}