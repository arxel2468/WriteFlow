"use client";

import { useThemeStore } from "@/stores/theme-store";

const widthOptions = [
  { value: "narrow" as const, label: "Narrow", desc: "560px" },
  { value: "medium" as const, label: "Medium", desc: "720px" },
  { value: "wide" as const, label: "Wide", desc: "960px" },
];

export function WriterSettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useThemeStore((s) => s.writerSettings);
  const setSettings = useThemeStore((s) => s.setWriterSettings);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Writing Preferences</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <div className="mt-2 flex gap-2">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm capitalize transition-colors ${
                    theme === t
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {t === "light" ? "☀️ " : "🌙 "}{t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min={14}
              max={22}
              step={1}
              value={settings.fontSize}
              onChange={(e) => setSettings({ fontSize: Number(e.target.value) })}
              className="mt-2 w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Compact</span>
              <span>Comfortable</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Line Spacing: {settings.lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min={1.4}
              max={2.2}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => setSettings({ lineHeight: Number(e.target.value) })}
              className="mt-2 w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tight</span>
              <span>Spacious</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Editor Width</label>
            <div className="mt-2 flex gap-2">
              {widthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSettings({ editorWidth: opt.value })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                    settings.editorWidth === opt.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}