import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

    let draft = await prisma.draft.findFirst({
      where: { projectId: id },
    });

    if (!draft) {
      draft = await prisma.draft.create({
        data: { projectId: id, content: {} },
      });
    }

    return NextResponse.json(draft);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch draft:", message);
    return NextResponse.json({ error: "Failed to fetch draft" }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { content, wordCount } = body as {
      content: Prisma.InputJsonValue;
      wordCount: number;
    };

    let draft = await prisma.draft.findFirst({
      where: { projectId: id },
    });

    if (!draft) {
      draft = await prisma.draft.create({
        data: { projectId: id, content: content || {}, wordCount: wordCount || 0 },
      });
    } else {
      draft = await prisma.draft.update({
        where: { id: draft.id },
        data: { content: content || {}, wordCount: wordCount || 0 },
      });
    }

    return NextResponse.json(draft);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to update draft:", message);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}