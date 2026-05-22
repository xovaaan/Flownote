import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { transcribeAudio } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("audio");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = file instanceof File ? file.name : "audio.webm";
  const mimeType = file.type || "audio/webm";
  const prompt = formData.get("prompt");
  const context = typeof prompt === "string" ? prompt : undefined;

  try {
    const text = await transcribeAudio(buffer, filename, mimeType, context);
    return NextResponse.json({ text, empty: !text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
