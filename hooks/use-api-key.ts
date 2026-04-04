"use client";

import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("writeflow-groq-key");
    if (stored) setApiKeyState(stored);

    // Listen for changes from other components
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "writeflow-groq-key") {
        setApiKeyState(e.newValue || "");
      }
    };
    
    // Custom event for same-window updates
    const handleCustom = (e: CustomEvent) => {
      setApiKeyState(e.detail || "");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("writeflow-key-change", handleCustom as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("writeflow-key-change", handleCustom as EventListener);
    };
  }, []);

  function setApiKey(key: string) {
    if (key) {
      localStorage.setItem("writeflow-groq-key", key);
    } else {
      localStorage.removeItem("writeflow-groq-key");
    }
    setApiKeyState(key);
    // Dispatch custom event so other components update instantly
    window.dispatchEvent(new CustomEvent("writeflow-key-change", { detail: key }));
  }

  return { apiKey, setApiKey, hasKey: !!apiKey };
}