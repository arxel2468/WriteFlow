import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createClusterSchema } from "@/lib/validations/cluster";

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

    const clusters = await prisma.cluster.findMany({
      where: { projectId: id },
      orderBy: { position: "asc" },
      include: {
        atoms: {
          where: { isArchived: false },
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(clusters);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch clusters:", message);
    return NextResponse.json({ error: "Failed to fetch clusters" }, { status: 500 });
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

    const body: unknown = await request.json();
    const result = createClusterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const maxPosition = await prisma.cluster.aggregate({
      where: { projectId: id },
      _max: { position: true },
    });

    const cluster = await prisma.cluster.create({
      data: {
        title: result.data.title,
        projectId: id,
        position: (maxPosition._max.position ?? -1) + 1,
      },
      include: {
        atoms: { where: { isArchived: false }, orderBy: { position: "asc" } },
      },
    });

    return NextResponse.json(cluster, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to create cluster:", message);
    return NextResponse.json({ error: "Failed to create cluster" }, { status: 500 });
  }
}
