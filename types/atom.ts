export type Atom = {
  id: string;
  projectId: string;
  content: string;
  clusterId: string | null;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};
