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
    <div className="relative rounded-xl bg-card shadow-sm">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind? Press Enter to add..."
        rows={3}
        maxLength={500}
        className="w-full resize-none rounded-xl border-0 bg-transparent px-4 pt-4 pb-8 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
        <span className={`text-xs ${value.length > 450 ? "text-warning" : "text-muted-foreground"}`}>
          {value.length}/500
        </span>
        {value.trim() && (
          <button
            onClick={handleSubmit}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add ↵
          </button>
        )}
      </div>
    </div>
  );
}