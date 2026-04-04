import type { Prisma } from "@prisma/client";

export type Draft = {
  id: string;
  projectId: string;
  content: Prisma.JsonValue;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};