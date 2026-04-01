import { DumpView } from "@/components/dump/dump-view";

export default async function DumpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DumpView projectId={id} />;
}
