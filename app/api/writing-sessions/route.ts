import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET — fetch last 365 days of sessions for heatmap
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);

    const sessions = await prisma.writingSession.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, wordCount: true, duration: true },
    });

    // Compute streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = new Set(
      sessions.map((s) => new Date(s.date).toISOString().slice(0, 10))
    );

    let streak = 0;
    const check = new Date(today);
    while (true) {
      const key = check.toISOString().slice(0, 10);
      if (dates.has(key)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
    const totalDays = dates.size;

    return NextResponse.json({ sessions, streak, totalWords, totalDays });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to fetch writing sessions:", message);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// POST — upsert today's session (called from editor)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wordCount, duration } = (await request.json()) as {
      wordCount: number;
      duration: number;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const session = await prisma.writingSession.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        wordCount: { set: wordCount },
        duration: { increment: duration },
      },
      create: {
        userId: user.id,
        date: today,
        wordCount,
        duration,
      },
    });

    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to upsert writing session:", message);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}