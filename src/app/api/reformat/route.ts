import { NextResponse } from "next/server";
import { generateText, streamText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getSystemPrompt, getUserPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";
import type { ConversationStyle, QuizResult, GroupChatResult, ReformatRequest } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, format, conversationStyle = "tutor", demo, useGenerate } = body as ReformatRequest & { demo?: boolean; useGenerate?: boolean };

    // Auth check (skip for demo)
    if (!demo) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        );
      }
    }

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

      // Non-streaming mode for progressive reveal
      if (useGenerate) {
        const { text: responseText } = await generateText({
          model: getModel(),
          system: getSystemPrompt("conversation", style),
          prompt: getUserPrompt("conversation", text),
          maxOutputTokens: 4096,
          temperature: 0.7,
        });

        let jsonStr = responseText.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
        }

        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({
          speakers: parsed.speakers,
          dialogue: parsed.dialogue,
        });
      }

      // Streaming mode (legacy)
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

    if (format === "groupchat") {
      const { text: responseText } = await generateText({
        model: getModel(),
        system: getSystemPrompt("groupchat"),
        prompt: getUserPrompt("groupchat", text),
        maxOutputTokens: 2048,
        temperature: 0.8,
      });

      let jsonStr = responseText.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(jsonStr);

      const COLORS: Record<string, string> = {
        Casey: "#2dd4bf",
        Riley: "#a78bfa",
        Morgan: "#fb923c",
      };

      const groupChatResult: GroupChatResult = {
        format: "groupchat",
        messages: parsed.messages.map(
          (m: { sender: string; text: string }, i: number) => ({
            id: `msg-${i}`,
            sender: m.sender,
            text: m.text,
            isUser: false,
            color: COLORS[m.sender] || "#2dd4bf",
          })
        ),
      };

      return NextResponse.json(groupChatResult);
    }

    return NextResponse.json(
      { error: "Only conversation, quiz, and groupchat formats use the API." },
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
