import { z } from "zod";

export const createClusterSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
});

export const updateClusterSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

export const reorderClustersSchema = z.object({
  clusters: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
    })
  ),
});

export type CreateClusterInput = z.infer<typeof createClusterSchema>;
export type UpdateClusterInput = z.infer<typeof updateClusterSchema>;
