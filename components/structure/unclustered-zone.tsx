"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableAtom } from "./draggable-atom";
import type { Atom } from "@/types/atom";

export function UnclusteredZone({ atoms }: { atoms: Atom[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unclustered" });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
        isOver ? "border-accent bg-accent/5" : "border-border"
      }`}
    >
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Unclustered ({atoms.length})
      </h3>
      <SortableContext items={atoms.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {atoms.map((atom) => (
            <DraggableAtom key={atom.id} atom={atom} />
          ))}
        </div>
      </SortableContext>
      {atoms.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Drag atoms here to uncluster them
        </p>
      )}
    </div>
  );
}
