"use client";

import { useEffect } from "react";

const shortcuts = [
  { keys: ["Ctrl", "B"], label: "Bold" },
  { keys: ["Ctrl", "I"], label: "Italic" },
  { keys: ["Ctrl", "U"], label: "Underline" },
  { keys: ["Ctrl", "Alt", "1"], label: "Heading 1" },
  { keys: ["Ctrl", "Alt", "2"], label: "Heading 2" },
  { keys: ["Ctrl", "Alt", "3"], label: "Heading 3" },
  { keys: ["Ctrl", "Z"], label: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], label: "Redo" },
  { keys: ["Tab"], label: "Indent list item" },
  { keys: ["Shift", "Tab"], label: "Outdent list item" },
  { keys: ["Esc"], label: "Exit Focus Mode" },
];

export function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-muted-foreground text-center">
          Press <kbd className="rounded border border-border bg-muted px-1 font-mono">?</kbd> to open this anytime
        </p>
      </div>
    </div>
  );
}