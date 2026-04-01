"use client";

import { useThemeStore, type Theme } from "@/stores/theme-store";

const themes: { value: Theme; label: string; preview: string }[] = [
  { value: "light", label: "Light", preview: "bg-white border-gray-200" },
  { value: "dark", label: "Dark", preview: "bg-[#1A1A1D] border-[#3A3A3F]" },
  { value: "sepia", label: "Sepia", preview: "bg-[#F4ECD8] border-[#D4C9A8]" },
];

export function ThemeSwitcher() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="flex items-center gap-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${t.preview} ${
            theme === t.value ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""
          }`}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        >
          {theme === t.value && (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
