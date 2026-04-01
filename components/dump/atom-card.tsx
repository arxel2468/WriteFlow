"use client";

import { useState, useRef, useEffect } from "react";
import type { Atom } from "@/types/atom";

export function AtomCard({
  atom,
  onUpdate,
  onDelete,
}: {
  atom: Atom;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(atom.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  function handleSave() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== atom.content) {
      onUpdate(atom.id, trimmed);
    } else {
      setValue(atom.content);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setValue(atom.content);
      setEditing(false);
    }
  }

  const timeAgo = formatTime(atom.createdAt);

  return (
    <div className="group rounded-lg bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {editing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={2}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <p
          className="cursor-text whitespace-pre-wrap text-sm leading-relaxed"
          onClick={() => setEditing(true)}
        >
          {atom.content}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <button
          onClick={() => onDelete(atom.id)}
          className="rounded px-2 py-0.5 text-xs text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}
