"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dump", segment: "dump" },
  { label: "Structure", segment: "structure" },
  { label: "Write", segment: "write" },
];

export function WorkspaceNav({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
            {projectTitle}
          </h1>
        </div>

        <nav className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => {
            const href = `/project/${projectId}/${tab.segment}`;
            const isActive = pathname === href;

            return (
              <Link
                key={tab.segment}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
