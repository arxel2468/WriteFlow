import type { Prisma } from "@prisma/client";

export type Snapshot = {
  id: string;
  draftId: string;
  content: Prisma.JsonValue;
  wordCount: number;
  label: string | null;
  createdAt: string;
};