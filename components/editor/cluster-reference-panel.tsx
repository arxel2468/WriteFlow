"use client";

import { useState } from "react";
import type { Cluster } from "@/types/cluster";

export function ClusterReferencePanel({ clusters }: { clusters: Cluster[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="sticky top-24 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Your Outline
      </h3>
      {clusters.map((cluster) => (
        <div key={cluster.id} className="rounded-lg bg-card p-3 shadow-sm">
          <button
            onClick={() => toggle(cluster.id)}
            className="flex w-full items-center justify-between text-left text-sm font-medium"
          >
            {cluster.title}
            <span className="text-xs text-muted-foreground">
              {collapsed[cluster.id] ? "+" : "−"}
            </span>
          </button>
          {!collapsed[cluster.id] && cluster.atoms.length > 0 && (
            <ul className="mt-2 space-y-1">
              {cluster.atoms.map((atom) => (
                <li
                  key={atom.id}
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  • {atom.content}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {clusters.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Structure your atoms first to see your outline here.
        </p>
      )}
    </div>
  );
}
