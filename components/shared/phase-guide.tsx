"use client";

import { useState, useEffect } from "react";

type PhaseGuideProps = {
  phase: "dump" | "structure" | "write";
  itemCount: number;
};

const guides = {
  dump: {
    title: "Brain Dump",
    steps: [
      "Type any thought, idea, or fragment — no need to organize yet",
      "Press Enter to add each thought as a card",
      "Click any card to edit it inline",
      "When you have enough thoughts, move to Structure →",
    ],
    minItems: 0,
    nextHint: "💡 Try adding at least 5-10 thoughts before moving to Structure.",
  },
  structure: {
    title: "Structure",
    steps: [
      "Create clusters (groups) that represent sections of your writing",
      "Drag thoughts from Unclustered into the right cluster",
      "Reorder thoughts within clusters to plan your flow",
      "Use ✨ AI Suggest Clusters to get grouping ideas",
    ],
    minItems: 0,
    nextHint: "💡 Once your clusters feel right, move to Write →",
  },
  write: {
    title: "Write",
    steps: [
      "Your outline is on the left — click any thought to insert it",
      "Expand each thought into full sentences and paragraphs",
      "Use the toolbar for formatting (or keyboard shortcuts)",
      "Your work auto-saves every 3 seconds",
    ],
    minItems: 0,
    nextHint: "💡 Use Focus Mode to hide the sidebar and concentrate.",
  },
};

export function PhaseGuide({ phase, itemCount }: PhaseGuideProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`writeflow-guide-${phase}`);
    if (stored === "dismissed") setDismissed(true);
  }, [phase]);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(`writeflow-guide-${phase}`, "dismissed");
  }

  if (dismissed || itemCount > 3) return null;

  const guide = guides[phase];

  return (
    <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            How {guide.title} works
          </h3>
          <ol className="mt-2 space-y-1">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">{guide.nextHint}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss guide"
        >
          ✕
        </button>
      </div>
    </div>
  );
}