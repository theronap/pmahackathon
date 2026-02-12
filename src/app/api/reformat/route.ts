import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getSystemPrompt, getUserPrompt } from "@/lib/llm/prompts";
import type { ConversationStyle, ConversationResult, ReformatRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body: ReformatRequest = await request.json();
    const { text, format, conversationStyle = "tutor" } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    if (text.length > 15000) {
      return NextResponse.json(
        { error: "Text exceeds the 15,000 character limit." },
        { status: 400 }
      );
    }

    if (format !== "conversation") {
      return NextResponse.json(
        { error: "Only conversation format uses the API." },
        { status: 400 }
      );
    }

    const style: ConversationStyle = conversationStyle === "study-group" ? "study-group" : "tutor";

    const { text: responseText } = await generateText({
      model: getModel(),
      system: getSystemPrompt(style),
      prompt: getUserPrompt(text),
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    // Parse the JSON from Claude's response
    // Strip markdown code fences if present
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    const result: ConversationResult = {
      format: "conversation",
      style,
      speakers: parsed.speakers,
      dialogue: parsed.dialogue,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("Reformat API error:", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse the AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
