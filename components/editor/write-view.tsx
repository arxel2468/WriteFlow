"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TiptapEditor } from "./tiptap-editor";
import { ClusterReferencePanel } from "./cluster-reference-panel";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import { AiAnalysisPanel } from "@/components/ai/ai-analysis-panel";
import { PhaseGuide } from "@/components/shared/phase-guide";
import { toast } from "sonner";
import { HistoryPanel } from "./history-panel";
import type { Cluster } from "@/types/cluster";
import type { Draft } from "@/types/draft";
import type { Editor } from "@tiptap/react";
import type { Prisma } from "@prisma/client";
import Link from 'next/link'

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
  const [wordGoal, setWordGoal] = useState<number>(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(false);

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
    const interval = setInterval(async () => {
      try {
        await fetch(`/api/projects/${projectId}/snapshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: `Auto-save ${new Date().toLocaleTimeString()}` }),
        });
      } catch {
        // Silent — auto-snapshots are best-effort
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Escape key exits focus mode
  useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && focusMode) setFocusMode(false);
    if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && !target.closest?.(".ProseMirror")) {
        setShowShortcuts((v) => !v);
      }
    }
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [focusMode]);

  useEffect(() => {
  const stored = localStorage.getItem(`writeflow-goal-${projectId}`);
  if (stored) setWordGoal(Number(stored));
}, [projectId]);

function handleGoalChange(val: number) {
  setWordGoal(val);
  localStorage.setItem(`writeflow-goal-${projectId}`, String(val));
}

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
        toast.error(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "export.md";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Markdown exported successfully.");
    } catch {
      toast.error("Export failed. Check your connection.");
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

  const hasDraftContent =
    draft?.content && Object.keys(draft.content as object).length > 0;
  const hasAnyClusters = clusters.length > 0;

  return (
    <div className={focusMode ? "fixed inset-0 z-50 bg-background overflow-auto" : "mx-auto max-w-6xl px-4 py-8"}>
      {/* Header — hidden in focus mode */}
      {!focusMode && (
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
              {saveStatus === "idle" && draft?.wordCount ? "All changes saved" : ""}
            </span>
            <button
              onClick={() => setShowHistory(true)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              🕘 History
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={exporting}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export .md"}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Goal:</span>
              <input
                type="number"
                min={0}
                max={100000}
                step={100}
                value={wordGoal || ""}
                onChange={(e) => handleGoalChange(Number(e.target.value))}
                placeholder="words"
                className="h-7 w-20 rounded-md border border-input bg-background px-2 text-xs text-center placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              onClick={() => {
                setFocusMode(!focusMode);
                if (focusMode) setTypewriterMode(false);
              }}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                focusMode
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {focusMode ? "Exit Focus" : "Focus Mode"}
            </button>
            <button
              onClick={() => setTypewriterMode(!typewriterMode)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                typewriterMode
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {typewriterMode ? "Exit Typewriter" : "Typewriter"}
            </button>
          </div>
        </div>
      )}

      {/* Focus mode toolbar — minimal, always accessible */}
      {focusMode && (
        <div className="flex justify-end px-6 pt-4 pb-2">
          <button
            onClick={() => setFocusMode(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit Focus (Esc)
          </button>
        </div>
      )}

      {!focusMode && <PhaseGuide phase="write" itemCount={0} projectId={projectId} />}

      <div className={focusMode ? "mx-auto max-w-3xl px-6 pb-16" : "flex gap-6"}>
        {!focusMode && (
          <div className="w-72 shrink-0 space-y-6 self-start sticky top-20">
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
          {!hasDraftContent && !hasAnyClusters && (
            <div className="mb-6 rounded-xl border-2 border-dashed border-border p-8 text-center">
              <p className="text-2xl mb-3">✍️</p>
              <h3 className="text-sm font-semibold">Ready to write</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs mx-auto">
                Go back to{" "}
                <Link href={`/project/${projectId}/dump`} className="text-accent underline">
                  Brain Dump
                </Link>{" "}
                to capture thoughts, then{" "}
                <Link href={`/project/${projectId}/structure`} className="text-accent underline">
                  Structure
                </Link>{" "}
                them into clusters. Your outline will appear here as a writing guide.
              </p>
            </div>
          )}
          {!hasDraftContent && hasAnyClusters && (
            <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground">
              💡 Your outline is ready on the left. Click any thought to insert it, or start writing directly below.
            </div>
          )}
          <TiptapEditor
            initialContent={hasDraftContent ? (draft.content as Record<string, unknown>) : undefined}
            onSave={handleSave}
            onEditorReady={(editor) => { editorRef.current = editor; }}
            wordGoal={wordGoal}
            typewriterMode={typewriterMode}
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
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}