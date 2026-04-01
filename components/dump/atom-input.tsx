"use client";

import { useState, useRef } from "react";

export function AtomInput({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 500) return;
    onSubmit(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind? Press Enter to add..."
        rows={3}
        maxLength={500}
        className="w-full resize-none rounded-xl border-0 bg-surface px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-1 flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">{value.length}/500</span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
