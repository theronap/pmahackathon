import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/llm/provider";
import { getKeyTakeawaysSystemPrompt } from "@/lib/llm/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { text, demo } = await request.json();

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

    const { text: responseText } = await generateText({
      model: getModel(),
      system: getKeyTakeawaysSystemPrompt(),
      prompt: `Extract study notes from the following academic text.\n\n---\n${text}\n---`,
      maxOutputTokens: 1024,
      temperature: 0.3,
    });

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      takeaways: parsed.takeaways || [],
      definitions: parsed.definitions || [],
      summary: parsed.summary || "",
    });
  } catch (err) {
    console.error("Takeaways API error:", err);
    return NextResponse.json(
      { error: "Failed to extract takeaways." },
      { status: 500 }
    );
  }
}
