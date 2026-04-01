import { z } from "zod";

export const createAtomSchema = z.object({
  content: z.string().min(1, "Content is required").max(500, "Max 500 characters"),
});

export const updateAtomSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  clusterId: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0).optional(),
  isArchived: z.boolean().optional(),
});

export const reorderAtomsSchema = z.object({
  atoms: z.array(
    z.object({
      id: z.string().uuid(),
      clusterId: z.string().uuid().nullable(),
      position: z.number().int().min(0),
    })
  ),
});

export type CreateAtomInput = z.infer<typeof createAtomSchema>;
export type UpdateAtomInput = z.infer<typeof updateAtomSchema>;
