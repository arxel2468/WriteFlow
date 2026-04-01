import { StructureView } from "@/components/structure/structure-view";

export default async function StructurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StructureView projectId={id} />;
}
