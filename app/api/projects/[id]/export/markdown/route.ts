import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { tiptapToMarkdown, type TiptapNode } from "@/lib/export/to-markdown";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const draft = await prisma.draft.findFirst({
      where: { projectId: id },
    });

    if (!draft || !draft.content || Object.keys(draft.content as object).length === 0) {
      return NextResponse.json({ error: "No draft content to export" }, { status: 400 });
    }

    const markdown = tiptapToMarkdown(draft.content as TiptapNode);
    
    const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.md`;

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Export error:", message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}