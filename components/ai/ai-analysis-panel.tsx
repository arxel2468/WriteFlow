"use client";

import { useState } from "react";
import { useApiKey } from "@/hooks/use-api-key";
import { ApiKeySetup } from "./api-key-setup";

type AnalysisType = "logic-check" | "reverse-outline" | "coherence";

export function AiAnalysisPanel({
  getText,
  getSelectedText,
}: {
  getText: () => string;
  getSelectedText: () => string;
}) {
  const { apiKey, hasKey } = useApiKey();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<AnalysisType | null>(null);

  async function runAnalysis(type: AnalysisType) {
    const text = type === "logic-check" ? getSelectedText() || getText() : getText();

    if (!text || text.trim().length < 10) {
      setError("Write more content before running analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveType(type);

    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ text, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Analysis failed");
        return;
      }

      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Failed to connect. Check your internet.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasKey) {
    return <ApiKeySetup />;
  }

  const tools = [
    {
      type: "logic-check" as const,
      label: "🔍 Logic Check",
      desc: "Find logical flaws in selected text",
    },
    {
      type: "reverse-outline" as const,
      label: "📋 Reverse Outline",
      desc: "See what your draft actually says",
    },
    {
      type: "coherence" as const,
      label: "🔗 Flow Check",
      desc: "Analyze paragraph transitions",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        AI Thinking Partner
      </h3>

      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => runAnalysis(tool.type)}
            disabled={loading}
            className={`w-full rounded-lg p-3 text-left transition-colors ${
              activeType === tool.type && result
                ? "bg-accent/10 ring-1 ring-accent/30"
                : "bg-card shadow-sm hover:shadow-md"
            } disabled:opacity-50`}
          >
            <span className="text-sm font-medium">{tool.label}</span>
            <br />
            <span className="text-xs text-muted-foreground">{tool.desc}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-lg bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Analyzing...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Analysis Result
            </h4>
            <button
              onClick={() => {
                setResult(null);
                setActiveType(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground italic">
        AI analyzes your writing. It never writes for you.
      </p>
    </div>
  );
}
