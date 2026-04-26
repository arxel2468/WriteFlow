"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./editor-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallback, useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme-store";
import type { Editor } from "@tiptap/react";
import { useWritingSession } from "@/hooks/use-writing-session";



// Add prop
type TiptapEditorProps = {
  initialContent?: Record<string, unknown>;
  onSave: (content: Record<string, unknown>, wordCount: number) => void;
  onEditorReady?: (editor: Editor) => void;
  wordGoal?: number;
  typewriterMode?: boolean;
};




const widthMap = {
  narrow: "max-w-xl",
  medium: "max-w-3xl",
  wide: "max-w-5xl",
};


export function TiptapEditor({
  initialContent,
  onSave,
  onEditorReady,
  wordGoal,
  typewriterMode = false,
}: TiptapEditorProps) {
    const settings = useThemeStore((s) => s.writerSettings);
    const [liveWordCount, setLiveWordCount] = useState(0);
    useWritingSession(liveWordCount);
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
    immediatelyRender: false,
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
        class: "min-h-[400px] rounded-xl bg-card p-6 shadow-sm focus:outline-none",
        style: `font-size: ${settings.fontSize}px; line-height: ${settings.lineHeight}; ${typewriterMode ? "padding-top: 50vh;" : ""
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as Record<string, unknown>;
      const words = editor.storage.characterCount?.words() ?? 0;
      setLiveWordCount(words);
      debouncedSave(json, words);
    },
  });

  
useEffect(() => {
  if (!editor || !typewriterMode) return;

  function scrollToCursor() {
    const editorDom = editor?.view.dom;
    if (!editorDom) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect) return;

    const targetY = window.innerHeight / 2;
    const currentY = rect.top;
    const diff = currentY - targetY;

    window.scrollBy({ top: diff, behavior: "smooth" });
  }

  editor.on("selectionUpdate", scrollToCursor);
  editor.on("update", scrollToCursor);

  return () => {
    editor.off("selectionUpdate", scrollToCursor);
    editor.off("update", scrollToCursor);
  };
}, [editor, typewriterMode]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) {
    return <div className="h-96 animate-pulse rounded-xl bg-muted" />;
  }

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  

  return (
    <div className={`mx-auto ${widthMap[settings.editorWidth]}`}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="mt-2 space-y-1.5 px-1">
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>{wordCount} words · {charCount} characters</span>
    <span>{readingTime} min read</span>
  </div>
  {wordGoal && wordGoal > 0 && (
    <div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${Math.min(100, Math.round((wordCount / wordGoal) * 100))}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground text-right">
        {wordCount >= wordGoal
          ? `✓ Goal reached (${wordGoal} words)`
          : `${wordGoal - wordCount} words to goal`}
      </p>
    </div>
  )}
</div>
    </div>
  );
}
