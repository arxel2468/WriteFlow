import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { reorderAtomsSchema } from "@/lib/validations/atom";

export async function PATCH(
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

    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const result = reorderAtomsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    await prisma.$transaction(
      result.data.atoms.map((atom) =>
        prisma.atom.update({
          where: { id: atom.id },
          data: { clusterId: atom.clusterId, position: atom.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to reorder atoms:", message);
    return NextResponse.json({ error: "Failed to reorder atoms" }, { status: 500 });
  }
}
