import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import Link from "next/link";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  let project;
  try {
    project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Connection issue</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to reach the database. Check your connection.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm text-accent-foreground"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!project) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceNav projectId={id} projectTitle={project.title} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
