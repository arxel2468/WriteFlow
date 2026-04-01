import { WriteView } from "@/components/editor/write-view";

export default async function WritePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WriteView projectId={id} />;
}
