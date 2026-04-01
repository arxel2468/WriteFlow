"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

export function EditorToolbar({ editor }: { editor: Editor }) {
  const items = [
    {
      label: "B",
      title: "Bold (Ctrl+B)",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      className: "font-bold",
    },
    {
      label: "I",
      title: "Italic (Ctrl+I)",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      className: "italic",
    },
    {
      label: "U",
      title: "Underline (Ctrl+U)",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive("underline"),
      className: "underline",
    },
    { type: "separator" as const },
    {
      label: "H1",
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    { type: "separator" as const },
    {
      label: "• List",
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "1. List",
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      label: "Code",
      title: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
  ];

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg bg-surface p-1.5">
      {items.map((item, i) => {
        if ("type" in item && item.type === "separator") {
          return <div key={i} className="mx-1 h-5 w-px bg-border" />;
        }

        const btn = item as {
          label: string;
          title: string;
          action: () => void;
          isActive: boolean;
          className?: string;
        };

        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              btn.className,
              btn.isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}
