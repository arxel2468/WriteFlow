"use client";

import { useState } from "react";
import { useApiKey } from "@/hooks/use-api-key";
import { toast } from "sonner";
import type { Cluster } from "@/types/cluster";

const TONE_LABELS = ["Direct", "Analytical", "Narrative"] as const;

export function ClusterReferencePanel({
  clusters,
  onInsertAtom,
}: {
  clusters: Cluster[];
  onInsertAtom?: (content: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expanding, setExpanding] = useState<string | null>(null);
  const [expansions, setExpansions] = useState<Record<string, string[]>>({});
  const [activeExpansion, setActiveExpansion] = useState<string | null>(null);

  const { apiKey, hasKey } = useApiKey();

  function toggle(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleExpand(atomId: string, content: string) {
    // Toggle off if already showing
    if (activeExpansion === atomId) {
      setActiveExpansion(null);
      return;
    }

    // Use cached if available
    if (expansions[atomId]) {
      setActiveExpansion(atomId);
      return;
    }

    if (!hasKey) {
      toast.error("Set your Groq API key in the AI panel to use expansion.");
      return;
    }

    setExpanding(atomId);

    try {
      const res = await fetch("/api/ai/expand-atom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ atom: content }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Expansion failed.");
        return;
      }

      const data = await res.json();

      if (!data.sentences || data.sentences.length === 0) {
        toast.error("AI returned no suggestions. Try again.");
        return;
      }

      setExpansions((prev) => ({ ...prev, [atomId]: data.sentences }));
      setActiveExpansion(atomId);
    } catch {
      toast.error("Failed to connect. Check your internet.");
    } finally {
      setExpanding(null);
    }
  }

  function handleInsertSentence(sentence: string) {
    onInsertAtom?.(sentence);
    setActiveExpansion(null);
    toast.success("Inserted into editor.");
  }

  return (
    <div className="sticky top-24 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
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
                <li key={atom.id} className="rounded-md">
                  {/* Atom row */}
                  <div className="flex items-start gap-1 group">
                    <p
                      onClick={() => onInsertAtom?.(atom.content)}
                      className="flex-1 cursor-pointer rounded-md px-2 py-1 text-xs leading-relaxed text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                      title="Click to insert raw thought"
                    >
                      • {atom.content}
                    </p>
                    {/* Expand button */}
                    {hasKey && (
                      <button
                        onClick={() => handleExpand(atom.id, atom.content)}
                        disabled={expanding === atom.id}
                        className={`mt-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                          activeExpansion === atom.id
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent/10 hover:text-accent"
                        } disabled:opacity-40`}
                        title="Suggest opening sentences"
                      >
                        {expanding === atom.id ? "..." : "✨"}
                      </button>
                    )}
                  </div>

                  {/* Expansion panel */}
                  {activeExpansion === atom.id && expansions[atom.id] && (
                    <div className="mt-1.5 ml-2 rounded-lg border border-accent/20 bg-accent/5 p-2 space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Opening sentences — click to insert
                      </p>
                      {expansions[atom.id]!.map((sentence, i) => (
                        <button
                          key={i}
                          onClick={() => handleInsertSentence(sentence)}
                          className="w-full text-left rounded-md px-2 py-1.5 text-xs leading-relaxed text-foreground hover:bg-accent/10 transition-colors border border-transparent hover:border-accent/20"
                        >
                          <span className="text-[10px] font-medium text-accent mr-1.5">
                            {TONE_LABELS[i]}
                          </span>
                          {sentence}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          // Clear cache to force regeneration
                          setExpansions((prev) => {
                            const next = { ...prev };
                            delete next[atom.id];
                            return next;
                          });
                          void handleExpand(atom.id, atom.content);
                        }}
                        className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground pt-1 transition-colors"
                      >
                        ↺ Regenerate
                      </button>
                    </div>
                  )}
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

      {clusters.length > 0 && (
        <p className="text-[10px] text-muted-foreground italic">
          Click • to insert thought · ✨ for opening sentences
        </p>
      )}
    </div>
  );
}