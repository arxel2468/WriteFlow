import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceNav projectId={id} projectTitle={project.title} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
