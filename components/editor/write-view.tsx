"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TiptapEditor } from "./tiptap-editor";
import { ClusterReferencePanel } from "./cluster-reference-panel";
import type { Cluster } from "@/types/cluster";
import type { Draft } from "@/types/draft";
import type { Editor } from "@tiptap/react";
import { AiAnalysisPanel } from "@/components/ai/ai-analysis-panel";

export function WriteView({ projectId }: { projectId: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [focusMode, setFocusMode] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const hasFetched = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [draftRes, clustersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/draft`),
        fetch(`/api/projects/${projectId}/clusters`),
      ]);

      if (draftRes.ok) {
        const draftData: Draft = await draftRes.json();
        setDraft(draftData);
      }
      if (clustersRes.ok) {
        const clustersData: Cluster[] = await clustersRes.json();
        setClusters(clustersData);
      }
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [fetchData]);

  const handleSave = useCallback(
    async (content: Record<string, unknown>, wordCount: number) => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/projects/${projectId}/draft`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, wordCount }),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [projectId]
  );

  function handleInsertAtom(content: string) {
    if (editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent(`<p>${content}</p>`)
        .run();
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Write</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Expand your clusters into full prose.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "✓ Saved"}
          </span>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              focusMode
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {!focusMode && clusters.length > 0 && (
          <div className="w-72 shrink-0 space-y-6">
            <ClusterReferencePanel
              clusters={clusters}
              onInsertAtom={handleInsertAtom}
            />
            <AiAnalysisPanel
              getText={() => editorRef.current?.getText() || ""}
              getSelectedText={() => {
                const editor = editorRef.current;
                if (!editor) return "";
                const { from, to } = editor.state.selection;
                return editor.state.doc.textBetween(from, to, " ");
              }}
            />
          </div>
        )}

        <div className="flex-1">
          <TiptapEditor
            initialContent={
              draft?.content && Object.keys(draft.content).length > 0
                ? draft.content
                : undefined
            }
            onSave={handleSave}
            onEditorReady={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      </div>
    </div>
  );
}
