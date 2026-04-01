"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Atom } from "@/types/atom";

export function DraggableAtom({ atom }: { atom: Atom }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: atom.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg bg-surface px-3 py-2 text-sm shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <p className="line-clamp-3 whitespace-pre-wrap">{atom.content}</p>
    </div>
  );
}

export function DraggableAtomOverlay({ atom }: { atom: Atom }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2 text-sm shadow-lg ring-2 ring-accent">
      <p className="line-clamp-3 whitespace-pre-wrap">{atom.content}</p>
    </div>
  );
}
