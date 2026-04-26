import { NextRequest, NextResponse } from "next/server";
import { EXPAND_ATOM_PROMPT } from "@/lib/groq/prompts";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required." },
        { status: 401 }
      );
    }

    const { atom } = (await request.json()) as { atom: string };

    if (!atom || atom.trim().length < 3) {
      return NextResponse.json(
        { error: "Atom content too short." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: EXPAND_ATOM_PROMPT },
            { role: "user", content: atom },
          ],
          temperature: 0.7, // higher than analysis — we want variety
          max_tokens: 512,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
      if (response.status === 429)
        return NextResponse.json({ error: "Rate limited. Wait a moment." }, { status: 429 });
      return NextResponse.json({ error: "AI request failed." }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from AI." }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        return NextResponse.json(JSON.parse(jsonMatch[1]));
      }
      return NextResponse.json(
        { error: "AI returned invalid format. Try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Expand atom error:", message);
    return NextResponse.json({ error: "Expansion failed." }, { status: 500 });
  }
}