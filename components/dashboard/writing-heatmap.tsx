"use client";

import { useEffect, useState, useCallback } from "react";

type Session = {
  date: string;
  wordCount: number;
  duration: number;
};

type Stats = {
  sessions: Session[];
  streak: number;
  totalWords: number;
  totalDays: number;
};

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getIntensity(wordCount: number): number {
  if (wordCount === 0) return 0;
  if (wordCount < 100) return 1;
  if (wordCount < 300) return 2;
  if (wordCount < 600) return 3;
  return 4;
}

const intensityClasses = [
  "bg-muted",
  "bg-accent/20",
  "bg-accent/40",
  "bg-accent/70",
  "bg-accent",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function WritingHeatmap() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    date: string;
    wordCount: number;
    x: number;
    y: number;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/writing-sessions");
      if (res.ok) setStats(await res.json());
    } catch {
      console.error("Failed to fetch writing stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted" />;
  }

  if (!stats) return null;

  const days = getLastNDays(365);
  const sessionMap = new Map(
    (stats.sessions ?? []).map((s) => [
      new Date(s.date).toISOString().slice(0, 10),
      s,
    ])
  );

  // Pad to start on Sunday
  const firstDay = new Date(days[0] ?? "");
  const startPad = firstDay.getDay();
  const paddedDays: (string | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];

  // Build weeks (columns of 7)
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const firstReal = week.find((d) => d !== null);
    if (firstReal) {
      const month = new Date(firstReal).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month] ?? "", col });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      {/* Stats row */}
      <div className="mb-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {stats.streak}
            <span className="ml-1 text-lg">🔥</span>
          </p>
          <p className="text-xs text-muted-foreground">day streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {stats.totalWords.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">words this year</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{stats.totalDays}</p>
          <p className="text-xs text-muted-foreground">days written</p>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="relative overflow-x-auto">
        {/* Month labels */}
        <div className="mb-1 flex gap-[3px] pl-8">
          {weeks.map((_, col) => {
            const label = monthLabels.find((m) => m.col === col);
            return (
              <div key={col} className="w-[10px] shrink-0">
                {label && (
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {label.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-1">
            {DAYS.map((day, i) => (
              <div key={day} className="h-[10px] flex items-center">
                {i % 2 === 1 && (
                  <span className="text-[9px] text-muted-foreground w-6 text-right">
                    {day}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="h-[10px] w-[10px]" />;
                }
                const session = sessionMap.get(day);
                const words = session?.wordCount ?? 0;
                const intensity = getIntensity(words);
                return (
                  <div
                    key={day}
                    className={`h-[10px] w-[10px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-80 ${intensityClasses[intensity]}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        date: day,
                        wordCount: words,
                        x: rect.left,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {intensityClasses.map((cls, i) => (
          <div key={i} className={`h-[10px] w-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-md bg-popover border border-border px-2.5 py-1.5 text-xs shadow-md pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y - 36 }}
        >
          <p className="font-medium">
            {new Date(tooltip.date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground">
            {tooltip.wordCount > 0
              ? `${tooltip.wordCount.toLocaleString()} words`
              : "No writing"}
          </p>
        </div>
      )}
    </div>
  );
}