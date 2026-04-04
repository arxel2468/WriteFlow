"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AtomInput } from "./atom-input";
import { AtomCard } from "./atom-card";
import type { Atom } from "@/types/atom";
import { PhaseGuide } from "@/components/shared/phase-guide";

export function DumpView({ projectId }: { projectId: string }) {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const hasFetched = useRef(false);

  const fetchAtoms = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/atoms`);
      if (res.ok) {
        const data: Atom[] = await res.json();
        setAtoms(data);
      }
    } catch {
      console.error("Failed to fetch atoms");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAtoms();
    }
  }, [fetchAtoms]);

  async function handleCreate(content: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Atom = {
      id: tempId,
      projectId,
      content,
      clusterId: null,
      position: 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAtoms((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch(`/api/projects/${projectId}/atoms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const atom: Atom = await res.json();
        setAtoms((prev) => prev.map((a) => (a.id === tempId ? atom : a)));
      } else {
        setAtoms((prev) => prev.filter((a) => a.id !== tempId));
      }
    } catch {
      setAtoms((prev) => prev.filter((a) => a.id !== tempId));
    }
  }

  async function handleUpdate(id: string, content: string) {
    setAtoms((prev) => prev.map((a) => (a.id === id ? { ...a, content } : a)));

    try {
      await fetch(`/api/projects/${projectId}/atoms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {
      console.error("Failed to update atom");
    }
  }

  async function handleDelete(id: string) {
    const previous = atoms;
    setAtoms((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/projects/${projectId}/atoms/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setAtoms(previous);
      }
    } catch {
      setAtoms(previous);
    }
  }

  const filtered = search
    ? atoms.filter((a) => a.content.toLowerCase().includes(search.toLowerCase()))
    : atoms;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
	<PhaseGuide phase="dump" itemCount={atoms.length} />
        <h2 className="text-xl font-semibold">Brain Dump</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get every thought out. No organizing, no pressure.
        </p>
      </div>

      <AtomInput onSubmit={handleCreate} />

      {atoms.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {atoms.length} thought{atoms.length !== 1 ? "s" : ""}
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {filtered.map((atom) => (
          <AtomCard
            key={atom.id}
            atom={atom}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {atoms.length > 0 && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No thoughts match your search.
        </p>
      )}
    </div>
  );
}
