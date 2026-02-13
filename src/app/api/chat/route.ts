import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getGroupChatReplySystemPrompt, getStoryReplySystemPrompt } from "@/lib/llm/prompts";
import type { ConversationStyle } from "@/types";

export async function POST(request: Request) {
  try {
    const { chunk, thread, userMessage, mode, conversationStyle } = await request.json();

    if (!chunk || !userMessage) {
      return NextResponse.json(
        { error: "chunk and userMessage are required." },
        { status: 400 }
      );
    }

    const systemPrompt = mode === "story"
      ? getStoryReplySystemPrompt((conversationStyle as ConversationStyle) || "tutor")
      : getGroupChatReplySystemPrompt();

    const threadContext = (thread || [])
      .map((m: { sender?: string; speaker?: string; text: string }) => `${m.sender || m.speaker}: ${m.text}`)
      .join("\n");

    const { text: responseText } = await generateText({
      model: getModel(),
      system: systemPrompt,
      prompt: `Academic text being discussed:\n---\n${chunk}\n---\n\nRecent conversation:\n${threadContext}\n\nUser just said: "${userMessage}"\n\nReply as the most appropriate character.`,
      maxOutputTokens: 256,
      temperature: 0.8,
    });

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      sender: parsed.sender || parsed.speaker,
      text: parsed.text,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to generate reply." },
      { status: 500 }
    );
  }
}
