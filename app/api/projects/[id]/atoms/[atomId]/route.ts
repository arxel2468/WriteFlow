import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { updateAtomSchema } from "@/lib/validations/atom";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; atomId: string }> }
) {
  try {
    const { id, atomId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const result = updateAtomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const atom = await prisma.atom.update({
      where: { id: atomId },
      data: result.data,
    });

    return NextResponse.json(atom);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to update atom:", message);
    return NextResponse.json({ error: "Failed to update atom" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; atomId: string }> }
) {
  try {
    const { id, atomId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.atom.update({
      where: { id: atomId },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to delete atom:", message);
    return NextResponse.json({ error: "Failed to delete atom" }, { status: 500 });
  }
}
