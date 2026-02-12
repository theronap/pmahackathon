import { NextResponse } from "next/server";
import { generateText, streamText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getSystemPrompt, getUserPrompt } from "@/lib/llm/prompts";
import type { ConversationStyle, QuizResult, ReformatRequest } from "@/types";

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

    if (format === "conversation") {
      const style: ConversationStyle =
        conversationStyle === "study-group" ? "study-group" : "tutor";

      const result = streamText({
        model: getModel(),
        system: getSystemPrompt("conversation", style),
        prompt: getUserPrompt("conversation", text),
        maxOutputTokens: 4096,
        temperature: 0.7,
      });

      return result.toTextStreamResponse();
    }

    if (format === "quiz") {
      const { text: responseText } = await generateText({
        model: getModel(),
        system: getSystemPrompt("quiz"),
        prompt: getUserPrompt("quiz", text),
        maxOutputTokens: 4096,
        temperature: 0.7,
      });

      let jsonStr = responseText.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(jsonStr);

      const quizResult: QuizResult = {
        format: "quiz",
        questions: parsed.questions,
      };

      return NextResponse.json(quizResult);
    }

    return NextResponse.json(
      { error: "Only conversation and quiz formats use the API." },
      { status: 400 }
    );
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
