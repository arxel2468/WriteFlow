import { NextRequest, NextResponse } from "next/server";
import {
  LOGIC_CHECK_PROMPT,
  REVERSE_OUTLINE_PROMPT,
  COHERENCE_PROMPT,
} from "@/lib/groq/prompts";

const promptMap: Record<string, string> = {
  "logic-check": LOGIC_CHECK_PROMPT,
  "reverse-outline": REVERSE_OUTLINE_PROMPT,
  coherence: COHERENCE_PROMPT,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Set your Groq API key in settings." },
        { status: 401 }
      );
    }

    const { text, type } = (await request.json()) as {
      text: string;
      type: string;
    };

    const systemPrompt = promptMap[type];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Not enough text to analyze. Write more first." },
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
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limited. Wait a moment." }, { status: 429 });
      }
      return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return NextResponse.json({ result: content || "No analysis generated." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("AI analyze error:", message);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
