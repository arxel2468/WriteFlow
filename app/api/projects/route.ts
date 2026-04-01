import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id, isArchived: false },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            atoms: { where: { isArchived: false } },
            clusters: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch projects:", message);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            atoms: { where: { isArchived: false } },
            clusters: true,
          },
        },
      },
    });

    // Create default draft
    await prisma.draft.create({
      data: {
        projectId: project.id,
        content: {},
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to create project:", message);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}