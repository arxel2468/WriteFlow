"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "./project-card";
import { ProjectGridSkeleton } from "./project-skeleton";
import { EmptyState } from "./empty-state";
import { CreateProjectDialog } from "./create-project-dialog";
import { RenameProjectDialog } from "./rename-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/project";

export function ProjectGrid() {
  const { projects, isLoading, error, createProject, updateProject, deleteProject } =
    useProjects();

  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  async function handleCreate(title: string) {
    const project = await createProject({ title });
    if (!project) throw new Error("Failed to create");
  }

  async function handleRename(id: string, title: string) {
    return updateProject(id, { title });
  }

  async function handleDelete(id: string) {
    return deleteProject(id);
  }

  if (isLoading) {
    return <ProjectGridSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-accent underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      {projects.length > 0 && (
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>New Project</Button>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />

      <RenameProjectDialog
        project={renameTarget}
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onRename={handleRename}
      />

      <DeleteProjectDialog
        project={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </>
  );
}
