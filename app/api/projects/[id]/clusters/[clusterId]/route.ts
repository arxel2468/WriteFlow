import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { updateClusterSchema } from "@/lib/validations/cluster";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clusterId: string }> }
) {
  try {
    const { id, clusterId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const result = updateClusterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const cluster = await prisma.cluster.update({
      where: { id: clusterId, projectId: id },
      data: result.data,
      include: {
        atoms: { where: { isArchived: false }, orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(cluster);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to update cluster:", message);
    return NextResponse.json({ error: "Failed to update cluster" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; clusterId: string }> }
) {
  try {
    const { id, clusterId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Atoms go back to unclustered
    await prisma.atom.updateMany({
      where: { clusterId },
      data: { clusterId: null, position: 0 },
    });

    await prisma.cluster.delete({
      where: { id: clusterId, projectId: id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to delete cluster:", message);
    return NextResponse.json({ error: "Failed to delete cluster" }, { status: 500 });
  }
}
