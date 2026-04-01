"use client";

import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("writeflow-groq-key");
    if (stored) setApiKeyState(stored);
  }, []);

  function setApiKey(key: string) {
    if (key) {
      localStorage.setItem("writeflow-groq-key", key);
    } else {
      localStorage.removeItem("writeflow-groq-key");
    }
    setApiKeyState(key);
  }

  return { apiKey, setApiKey, hasKey: !!apiKey };
}
