import { NextRequest, NextResponse } from "next/server";
import { SUGGEST_CLUSTERS_PROMPT } from "@/lib/groq/prompts";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Set your Groq API key in settings." },
        { status: 401 }
      );
    }

    const { atoms } = (await request.json()) as { atoms: string[] };

    if (!atoms || atoms.length === 0) {
      return NextResponse.json(
        { error: "No atoms provided" },
        { status: 400 }
      );
    }

    const numberedAtoms = atoms
      .map((a: string, i: number) => `${i + 1}. ${a}`)
      .join("\n");

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
            { role: "system", content: SUGGEST_CLUSTERS_PROMPT },
            { role: "user", content: numberedAtoms },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Check your Groq key in settings." },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limited. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: (errorData as { error?: { message?: string } })?.error?.message || "AI request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON from the response
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        return NextResponse.json(parsed);
      }
      return NextResponse.json(
        { error: "AI returned invalid format. Try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("AI suggest-clusters error:", message);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
