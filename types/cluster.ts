import type { Atom } from "./atom";

export type Cluster = {
  id: string;
  projectId: string;
  title: string;
  position: number;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  atoms: Atom[];
};
