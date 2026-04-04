import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

    const draft = await prisma.draft.findFirst({
      where: { projectId: id, project: { userId: user.id } },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const snapshots = await prisma.snapshot.findMany({
      where: { draftId: draft.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(snapshots);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch snapshots:", message);
    return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label } = body as { label?: string };

    const draft = await prisma.draft.findFirst({
      where: { projectId: id, project: { userId: user.id } },
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Keep max 50 snapshots
    const count = await prisma.snapshot.count({ where: { draftId: draft.id } });
    if (count >= 50) {
      const oldest = await prisma.snapshot.findFirst({
        where: { draftId: draft.id },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) await prisma.snapshot.delete({ where: { id: oldest.id } });
    }

    const snapshot = await prisma.snapshot.create({
      data: {
        draftId: draft.id,
        content: draft.content || {},
        wordCount: draft.wordCount,
        label: label || `Snapshot ${new Date().toLocaleTimeString()}`,
      },
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to create snapshot:", message);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}