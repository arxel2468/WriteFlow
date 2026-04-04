"use client";

import { useState, useEffect, useCallback } from "react";
import type { Snapshot } from "@/types/snapshot";

export function HistoryPanel({
  projectId,
  onClose,
  onRestore,
}: {
  projectId: string;
  onClose: () => void;
  onRestore: (content: Record<string, unknown>, words: number) => void;
}) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/snapshots`);
      if (res.ok) setSnapshots(await res.json());
    } catch {
      console.error("Failed to fetch snapshots");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  async function createSnapshot() {
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const snap = await res.json();
        setSnapshots((prev) => [snap, ...prev].slice(0, 50));
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleRestore(snapshot: Snapshot) {
    if (!confirm("Restore this version? Your current unsaved changes will be lost.")) return;
    
    setRestoring(snapshot.id);
    try {
      const res = await fetch(`/api/projects/${projectId}/snapshots/${snapshot.id}/restore`, {
        method: "POST",
      });
      if (res.ok) {
        onRestore(snapshot.content as Record<string, unknown>, snapshot.wordCount);
        onClose();
      }
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 border-l border-border bg-card p-4 shadow-xl overflow-y-auto">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h2 className="font-semibold">Version History</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <button
        onClick={createSnapshot}
        disabled={creating}
        className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 mb-6"
      >
        {creating ? "Saving..." : "Save Snapshot Now"}
      </button>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : snapshots.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No snapshots yet.</p>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-border">
          {snapshots.map((snap) => (
            <div key={snap.id} className="relative pl-8">
              <div className="absolute left-[9px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-card" />
              <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{snap.label}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(snap.createdAt).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                  })}</span>
                  <span>{snap.wordCount} words</span>
                </div>
                <button
                  onClick={() => handleRestore(snap)}
                  disabled={!!restoring}
                  className="mt-3 w-full rounded border border-input py-1 text-xs font-medium hover:bg-muted"
                >
                  {restoring === snap.id ? "Restoring..." : "Restore this version"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}