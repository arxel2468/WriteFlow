import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; snapshotId: string }> }
) {
  try {
    const { id, snapshotId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await prisma.draft.findFirst({
      where: { projectId: id, project: { userId: user.id } },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const snapshot = await prisma.snapshot.findFirst({
      where: { id: snapshotId, draftId: draft.id },
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }

    // Restore content back to draft
    const updatedDraft = await prisma.draft.update({
      where: { id: draft.id },
      data: {
        content: snapshot.content || {},
        wordCount: snapshot.wordCount,
      },
    });

    return NextResponse.json(updatedDraft);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to restore snapshot:", message);
    return NextResponse.json({ error: "Failed to restore snapshot" }, { status: 500 });
  }
}