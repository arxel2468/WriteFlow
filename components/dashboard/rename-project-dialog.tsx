"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/project";

type RenameProjectDialogProps = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (id: string, title: string) => Promise<boolean>;
};

export function RenameProjectDialog({
  project,
  open,
  onOpenChange,
  onRename,
}: RenameProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setError("");
    }
  }, [project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    const trimmed = title.trim();

    if (!trimmed) {
      setError("Title is required");
      return;
    }

    if (trimmed.length > 200) {
      setError("Title must be 200 characters or less");
      return;
    }

    if (trimmed === project.title) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    setError("");

    const success = await onRename(project.id, trimmed);

    if (success) {
      onOpenChange(false);
    } else {
      setError("Failed to rename project. Please try again.");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Enter a new name for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Project title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoFocus
              aria-label="New project title"
            />
            {error && (
              <p className="mt-1.5 text-sm text-destructive">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
