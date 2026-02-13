import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Transcription service is not configured. Add OPENAI_API_KEY to enable voice recording." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ text: transcription });
  } catch (err) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
