import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getGroupChatReplySystemPrompt } from "@/lib/llm/prompts";

export async function POST(request: Request) {
  try {
    const { chunk, thread, userMessage } = await request.json();

    if (!chunk || !userMessage) {
      return NextResponse.json(
        { error: "chunk and userMessage are required." },
        { status: 400 }
      );
    }

    const threadContext = (thread || [])
      .map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`)
      .join("\n");

    const { text: responseText } = await generateText({
      model: getModel(),
      system: getGroupChatReplySystemPrompt(),
      prompt: `Academic text being discussed:\n---\n${chunk}\n---\n\nRecent chat:\n${threadContext}\n\nUser just said: "${userMessage}"\n\nReply as the most appropriate friend.`,
      maxOutputTokens: 256,
      temperature: 0.8,
    });

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      sender: parsed.sender,
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
