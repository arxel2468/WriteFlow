"use client";

import { ProjectGrid } from "./project-grid";
import { UserMenu } from "@/components/layout/user-menu";

type DashboardContentProps = {
  user: { name: string };
};

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <UserMenu name={user.name} />
      </div>

      <ProjectGrid />
    </main>
  );
}
