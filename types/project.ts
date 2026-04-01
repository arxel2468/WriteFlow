export type Project = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    atoms: number;
    clusters: number;
  };
};
