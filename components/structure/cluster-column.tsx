"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableAtom } from "./draggable-atom";
import type { Cluster } from "@/types/cluster";

export function ClusterColumn({
  cluster,
  onDelete,
  onRename,
}: {
  cluster: Cluster;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(cluster.title);
  const { setNodeRef, isOver } = useDroppable({ id: cluster.id });

  function handleSaveTitle() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== cluster.title) {
      onRename(cluster.id, trimmed);
    } else {
      setTitle(cluster.title);
    }
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl bg-card p-4 shadow-sm transition-all ${
        isOver ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setTitle(cluster.title);
                setEditing(false);
              }
            }}
            autoFocus
            className="h-7 flex-1 rounded border border-input bg-background px-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <h3
            className="cursor-text text-sm font-semibold"
            onClick={() => setEditing(true)}
          >
            {cluster.title}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({cluster.atoms.length})
            </span>
          </h3>
        )}
        <button
          onClick={() => onDelete(cluster.id)}
          className="ml-2 rounded p-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${cluster.title}`}
        >
          ✕
        </button>
      </div>

      <SortableContext
        items={cluster.atoms.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[60px] space-y-2">
          {cluster.atoms.map((atom) => (
            <DraggableAtom key={atom.id} atom={atom} />
          ))}
        </div>
      </SortableContext>

      {cluster.atoms.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Drop atoms here
        </p>
      )}
    </div>
  );
}
