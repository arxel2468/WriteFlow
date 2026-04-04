"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { UnclusteredZone } from "./unclustered-zone";
import { ClusterColumn } from "./cluster-column";
import { DraggableAtomOverlay } from "./draggable-atom";
import { useDebounce } from "@/hooks/use-debounce";
import { useApiKey } from "@/hooks/use-api-key";
import { ApiKeySetup } from "@/components/ai/api-key-setup";
import { PhaseGuide } from "@/components/shared/phase-guide";
import type { Atom } from "@/types/atom";
import type { Cluster } from "@/types/cluster";

export function StructureView({ projectId }: { projectId: string }) {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAtom, setActiveAtom] = useState<Atom | null>(null);
  const [newClusterTitle, setNewClusterTitle] = useState("");
  const hasFetched = useRef(false);

  const { apiKey, hasKey } = useApiKey();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    clusters: { title: string; atomNumbers: number[] }[];
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchData = useCallback(async () => {
    try {
      const [atomsRes, clustersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/atoms`),
        fetch(`/api/projects/${projectId}/clusters`),
      ]);

      if (atomsRes.ok && clustersRes.ok) {
        const atomsData: Atom[] = await atomsRes.json();
        const clustersData: Cluster[] = await clustersRes.json();
        setAtoms(atomsData.filter((a) => !a.clusterId));
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

  const saveReorder = useCallback(
    async (allAtoms: { id: string; clusterId: string | null; position: number }[]) => {
      try {
        await fetch(`/api/projects/${projectId}/atoms/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atoms: allAtoms }),
        });
      } catch {
        console.error("Failed to save reorder");
      }
    },
    [projectId]
  );

  const debouncedSave = useDebounce(saveReorder, 1000);

  function getAllAtomPositions(): { id: string; clusterId: string | null; position: number }[] {
    const result: { id: string; clusterId: string | null; position: number }[] = [];
    atoms.forEach((a, i) => result.push({ id: a.id, clusterId: null, position: i }));
    clusters.forEach((c) => {
      c.atoms.forEach((a, i) => result.push({ id: a.id, clusterId: c.id, position: i }));
    });
    return result;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const atom = atoms.find((a) => a.id === id) ||
      clusters.flatMap((c) => c.atoms).find((a) => a.id === id);
    setActiveAtom(atom || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceContainer = findContainer(activeId);
    const destContainer = findContainer(overId) || overId;

    if (sourceContainer === destContainer) return;

    const atomToMove =
      atoms.find((a) => a.id === activeId) ||
      clusters.flatMap((c) => c.atoms).find((a) => a.id === activeId);

    if (!atomToMove) return;

    if (sourceContainer === "unclustered") {
      setAtoms((prev) => prev.filter((a) => a.id !== activeId));
    } else {
      setClusters((prev) =>
        prev.map((c) =>
          c.id === sourceContainer
            ? { ...c, atoms: c.atoms.filter((a) => a.id !== activeId) }
            : c
        )
      );
    }

    if (destContainer === "unclustered") {
      setAtoms((prev) => [...prev, { ...atomToMove, clusterId: null }]);
    } else {
      setClusters((prev) =>
        prev.map((c) =>
          c.id === destContainer
            ? { ...c, atoms: [...c.atoms, { ...atomToMove, clusterId: c.id }] }
            : c
        )
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveAtom(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      debouncedSave(getAllAtomPositions());
      return;
    }

    const container = findContainer(activeId);

    if (container === "unclustered") {
      setAtoms((prev) => {
        const oldIdx = prev.findIndex((a) => a.id === activeId);
        const newIdx = prev.findIndex((a) => a.id === overId);
        if (oldIdx === -1 || newIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(oldIdx, 1);
        if (moved) next.splice(newIdx, 0, moved);
        return next;
      });
    } else if (container) {
      setClusters((prev) =>
        prev.map((c) => {
          if (c.id !== container) return c;
          const oldIdx = c.atoms.findIndex((a) => a.id === activeId);
          const newIdx = c.atoms.findIndex((a) => a.id === overId);
          if (oldIdx === -1 || newIdx === -1) return c;
          const next = [...c.atoms];
          const [moved] = next.splice(oldIdx, 1);
          if (moved) next.splice(newIdx, 0, moved);
          return { ...c, atoms: next };
        })
      );
    }

    setTimeout(() => debouncedSave(getAllAtomPositions()), 50);
  }

  function findContainer(atomId: string): string | null {
    if (atoms.some((a) => a.id === atomId)) return "unclustered";
    const cluster = clusters.find((c) => c.atoms.some((a) => a.id === atomId));
    return cluster?.id || null;
  }

  async function handleCreateCluster() {
    const trimmed = newClusterTitle.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (res.ok) {
        const cluster: Cluster = await res.json();
        setClusters((prev) => [...prev, cluster]);
        setNewClusterTitle("");
      }
    } catch {
      console.error("Failed to create cluster");
    }
  }

  async function handleDeleteCluster(clusterId: string) {
    const cluster = clusters.find((c) => c.id === clusterId);
    if (!cluster) return;

    setAtoms((prev) => [...prev, ...cluster.atoms.map((a) => ({ ...a, clusterId: null }))]);
    setClusters((prev) => prev.filter((c) => c.id !== clusterId));

    try {
      await fetch(`/api/projects/${projectId}/clusters/${clusterId}`, {
        method: "DELETE",
      });
    } catch {
      console.error("Failed to delete cluster");
    }
  }

  async function handleRenameCluster(clusterId: string, title: string) {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, title } : c))
    );

    try {
      await fetch(`/api/projects/${projectId}/clusters/${clusterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      console.error("Failed to rename cluster");
    }
  }

  async function handleAiSuggest() {
    if (!hasKey) return;

    const allAtoms = [...atoms, ...clusters.flatMap((c) => c.atoms)];

    if (allAtoms.length < 3) {
      alert("Add at least 3 thoughts in Brain Dump first.");
      return;
    }

    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/ai/suggest-clusters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          atoms: allAtoms.map((a) => a.content),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "AI request failed");
        return;
      }

      const data = await res.json();
      setAiSuggestion(data);
    } catch {
      alert("Failed to get AI suggestions. Check your connection.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleApplySuggestion() {
    if (!aiSuggestion) return;

    const allAtoms = [...atoms, ...clusters.flatMap((c) => c.atoms)];

    for (const suggestion of aiSuggestion.clusters) {
      const res = await fetch(`/api/projects/${projectId}/clusters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: suggestion.title }),
      });

      if (!res.ok) continue;

      const newCluster: Cluster = await res.json();

      const atomsToMove = suggestion.atomNumbers
        .map((n) => allAtoms[n - 1])
        .filter(Boolean);

      const reorderData = atomsToMove.map((atom, i) => ({
        id: atom!.id,
        clusterId: newCluster.id,
        position: i,
      }));

      if (reorderData.length > 0) {
        await fetch(`/api/projects/${projectId}/atoms/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atoms: reorderData }),
        });
      }
    }

    setAiSuggestion(null);
    hasFetched.current = false;
    setLoading(true);
    fetchData();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const totalAtoms = atoms.length + clusters.flatMap((c) => c.atoms).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Structure</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag atoms into clusters to build your outline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasKey && totalAtoms >= 3 && (
            <button
              onClick={handleAiSuggest}
              disabled={aiLoading}
              className="rounded-md bg-card border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {aiLoading ? "Thinking..." : "✨ AI Suggest Clusters"}
            </button>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New cluster name..."
              value={newClusterTitle}
              onChange={(e) => setNewClusterTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCluster()}
              className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={handleCreateCluster}
              disabled={!newClusterTitle.trim()}
              className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <PhaseGuide phase="structure" itemCount={clusters.length} />

      {/* API Key Setup (shown only if no key and enough atoms) */}
      {!hasKey && totalAtoms >= 3 && (
        <div className="mb-6">
          <ApiKeySetup />
        </div>
      )}

      {/* AI Suggestion Preview */}
      {aiSuggestion && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span>✨</span> AI Suggestion
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Powered by Llama-3.1-8B. You can apply these or dismiss them.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplySuggestion}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90"
              >
                Apply All
              </button>
              <button
                onClick={() => setAiSuggestion(null)}
                className="rounded-md border border-input px-3 py-1.5 text-xs text-foreground hover:bg-muted"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aiSuggestion.clusters.map((suggestion, i) => {
              const allAtoms = [...atoms, ...clusters.flatMap((c) => c.atoms)];
              return (
                <div key={i} className="rounded-lg border border-border bg-background p-3">
                  <h4 className="text-sm font-medium">{suggestion.title}</h4>
                  <ul className="mt-2 space-y-1">
                    {suggestion.atomNumbers.map((n) => {
                      const atom = allAtoms[n - 1];
                      return atom ? (
                        <li key={n} className="text-xs text-muted-foreground">
                          • {atom.content.slice(0, 80)}
                          {atom.content.length > 80 ? "..." : ""}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
          <UnclusteredZone atoms={atoms} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <ClusterColumn
                key={cluster.id}
                cluster={cluster}
                onDelete={handleDeleteCluster}
                onRename={handleRenameCluster}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeAtom ? <DraggableAtomOverlay atom={activeAtom} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}