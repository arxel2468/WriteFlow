"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./editor-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback } from "react";

type TiptapEditorProps = {
  initialContent?: Record<string, unknown>;
  onSave: (content: Record<string, unknown>, wordCount: number) => void;
};

export function TiptapEditor({ initialContent, onSave }: TiptapEditorProps) {
  const debouncedSave = useDebounce(
    useCallback(
      (json: Record<string, unknown>, words: number) => {
        onSave(json, words);
      },
      [onSave]
    ),
    3000
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing your draft...",
      }),
      Underline,
      CharacterCount,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[400px] rounded-xl bg-card p-6 shadow-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as Record<string, unknown>;
      const words = editor.storage.characterCount?.words() ?? 0;
      debouncedSave(json, words);
    },
  });

  if (!editor) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  }

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {wordCount} words · {charCount} characters
        </span>
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
}
