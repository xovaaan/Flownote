const GROQ_API_BASE = "https://api.groq.com/openai/v1";

export async function transcribeAudio(
  audio: Buffer,
  filename: string,
  mimeType: string,
  prompt?: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(audio)], { type: mimeType }), filename);
  formData.append("model", "whisper-large-v3");
  formData.append("language", "en");
  formData.append("response_format", "json");
  if (prompt) formData.append("prompt", prompt.slice(-400));

  const res = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq transcription failed: ${err}`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text?.trim() || "";
}
