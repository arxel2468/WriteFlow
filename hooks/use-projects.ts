"use client";

import { useCallback, useEffect, useRef } from "react";
import { useProjectStore } from "@/stores/project-store";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";
import type { Project } from "@/types/project";

export function useProjects() {
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const error = useProjectStore((s) => s.error);
  const setProjects = useProjectStore((s) => s.setProjects);
  const addProject = useProjectStore((s) => s.addProject);
  const updateProjectInStore = useProjectStore((s) => s.updateProject);
  const removeProject = useProjectStore((s) => s.removeProject);
  const setLoading = useProjectStore((s) => s.setLoading);
  const setError = useProjectStore((s) => s.setError);

  const hasFetched = useRef(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/projects");

      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data: Project[] = await res.json();
      setProjects(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLoading(false);
    }
  }, [setProjects, setLoading, setError]);

  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project | null> => {
      try {
        setError(null);

        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create project");
        }

        const project: Project = await res.json();
        addProject(project);
        return project;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return null;
      }
    },
    [addProject, setError]
  );

  const updateProject = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<boolean> => {
      const previous = useProjectStore.getState().projects.find((p) => p.id === id);
      if (previous) {
        updateProjectInStore(id, input as Partial<Project>);
      }

      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          if (previous) {
            updateProjectInStore(id, previous);
          }
          throw new Error("Failed to update project");
        }

        const updated: Project = await res.json();
        updateProjectInStore(id, updated);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return false;
      }
    },
    [updateProjectInStore, setError]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = useProjectStore.getState().projects;
      removeProject(id);

      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          setProjects(previous);
          throw new Error("Failed to delete project");
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return false;
      }
    },
    [removeProject, setProjects, setError]
  );

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchProjects();
    }
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
