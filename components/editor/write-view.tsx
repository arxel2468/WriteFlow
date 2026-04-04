"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TiptapEditor } from "./tiptap-editor";
import { ClusterReferencePanel } from "./cluster-reference-panel";
import { AiAnalysisPanel } from "@/components/ai/ai-analysis-panel";
import { PhaseGuide } from "@/components/shared/phase-guide";
import { HistoryPanel } from "./history-panel";
import type { Cluster } from "@/types/cluster";
import type { Draft } from "@/types/draft";
import type { Editor } from "@tiptap/react";
import type { Prisma } from "@prisma/client";

export function WriteView({ projectId }: { projectId: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [focusMode, setFocusMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const hasFetched = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const [draftRes, clustersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/draft`),
        fetch(`/api/projects/${projectId}/clusters`),
      ]);

      if (draftRes.ok) setDraft(await draftRes.json());
      if (clustersRes.ok) setClusters(await clustersRes.json());
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

  // Auto-snapshot every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/projects/${projectId}/snapshots`, { method: "POST", body: JSON.stringify({}) });
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projectId]);

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
      editorRef.current.chain().focus().insertContent(`<p>${content}</p>`).run();
    }
  }

  function handleRestore(content: Record<string, unknown>, words: number) {
    if (editorRef.current) {
      editorRef.current.commands.setContent(content);
      setDraft((prev) => prev ? { ...prev, content: content as Prisma.JsonValue, wordCount: words } : null);
    }
  }

  async function handleExportMarkdown() {
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export/markdown`);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "export.md";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Check your connection.");
    } finally {
      setExporting(false);
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
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Write</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Expand your clusters into full prose.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "✓ Saved"}
            {saveStatus === "idle" && "All changes saved"}
          </span>
          <button
            onClick={() => setShowHistory(true)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            🕘 History
          </button>
          <button
            onClick={handleExportMarkdown}
            disabled={exporting}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export .md"}
          </button>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              focusMode
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </button>
        </div>
      </div>

      <PhaseGuide phase="write" itemCount={0} />

      <div className="flex gap-6">
        {!focusMode && (
          <div className="w-72 shrink-0 space-y-6">
            {clusters.length > 0 && (
              <ClusterReferencePanel
                clusters={clusters}
                onInsertAtom={handleInsertAtom}
              />
            )}
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
              draft?.content && Object.keys(draft.content as object).length > 0
                ? (draft.content as Record<string, unknown>)
                : undefined
            }
            onSave={handleSave}
            onEditorReady={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      </div>

      {showHistory && (
        <HistoryPanel
          projectId={projectId}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}