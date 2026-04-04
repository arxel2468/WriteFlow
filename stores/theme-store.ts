import { create } from "zustand";

export type Theme = "light" | "dark";

type WriterSettings = {
  fontSize: number;
  lineHeight: number;
  editorWidth: "narrow" | "medium" | "wide";
};

type ThemeStore = {
  theme: Theme;
  writerSettings: WriterSettings;
  setTheme: (theme: Theme) => void;
  setWriterSettings: (settings: Partial<WriterSettings>) => void;
};

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("writeflow-theme") as Theme) || "dark";
}

function getStoredSettings(): WriterSettings {
  if (typeof window === "undefined") {
    return { fontSize: 16, lineHeight: 1.8, editorWidth: "medium" };
  }
  const stored = localStorage.getItem("writeflow-writer-settings");
  if (stored) {
    try {
      return JSON.parse(stored) as WriterSettings;
    } catch {
      return { fontSize: 16, lineHeight: 1.8, editorWidth: "medium" };
    }
  }
  return { fontSize: 16, lineHeight: 1.8, editorWidth: "medium" };
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getStoredTheme(),
  writerSettings: getStoredSettings(),

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("writeflow-theme", theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
    set({ theme });
  },

  setWriterSettings: (partial) => {
    set((state) => {
      const updated = { ...state.writerSettings, ...partial };
      if (typeof window !== "undefined") {
        localStorage.setItem("writeflow-writer-settings", JSON.stringify(updated));
      }
      return { writerSettings: updated };
    });
  },
}));