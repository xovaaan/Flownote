const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY;

const MODELS = {
  primary: "nvidia/nemotron-3-super-120b-a12b:free",
  fallback: "nvidia/nemotron-nano-2-vl:free",
  auto: "openrouter/auto",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenRouter(
  messages: ChatMessage[],
  model: string = MODELS.primary,
  temperature: number = 0.3,
  maxTokens: number = 4000
) {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Granola Web",
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

export async function enhanceNotes(rawNotes: string, transcript: string): Promise<string> {
  if (!API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

  const systemPrompt = `You are an expert meeting note enhancer. Produce a polished meeting summary as clean HTML for a modern notes app.

STRICT FORMAT RULES:
- Output ONLY an HTML fragment. No markdown. No # or ## symbols. No asterisks for bold. No code fences.
- Use only these tags: h2, h3, p, strong, em, ul, ol, li, blockquote, table, thead, tbody, tr, th, td
- Section titles must be <h2> (e.g. Overview, Key Decisions, Action Items, Follow-ups)
- Use <strong> for names, decisions, dates, and key terms
- Use <ul><li> or <ol><li> for simple lists
- For action items or structured data with columns, use an HTML <table> with <thead><tr><th>...</th></tr></thead> and <tbody><tr><td>...</td></tr></tbody> — NEVER markdown pipe tables (no | characters)
- Use <p> for paragraphs
- Use <blockquote> for direct quotes from the transcript
- Keep tone professional and warm
- Preserve the user's intent; lightly fix grammar only where needed
- No preamble, no explanation, no wrapping <html> or <body> tags`;

  const userPrompt = `Raw user notes:
${rawNotes || "(No raw notes provided)"}

Transcript:
${transcript || "(No transcript provided)"}

Create the enhanced summary as HTML.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  for (const model of [MODELS.primary, MODELS.fallback, MODELS.auto]) {
    try {
      const result = await callOpenRouter(messages, model, 0.3, 4000);
      if (result.trim()) return result;
    } catch (err) {
      console.error(`enhanceNotes failed with ${model}:`, err);
    }
  }

  throw new Error("All AI models failed. Check your OpenRouter API key and try again.");
}

export async function askMeetingQuestion(question: string, notes: string, transcript: string): Promise<string> {
  const systemPrompt = `You are a helpful meeting assistant. Answer the user's question based ONLY on the provided meeting notes and transcript. If the answer isn't in the context, say so clearly.

Formatting rules:
- Use **bold** for key terms, names, decisions, and action items.
- Use bullet lists (- item) when listing multiple things.
- Use numbered lists (1. item) for steps or ordered information.
- Use short paragraphs. Never write a wall of text.
- Do NOT use headers (##) for short answers.
- Be concise and direct. No filler phrases like "Based on the notes..." or "Certainly!".`;
  const userPrompt = `## Meeting Notes
${notes}

## Transcript
${transcript}

## Question
${question}`;
  return callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.primary, 0.4, 2000);
}

export async function searchAcrossNotes(query: string, notes: { id: string; title: string; content: string; date: string }[]): Promise<string> {
  const systemPrompt = `You are a knowledge retrieval assistant. The user has a collection of meeting notes. Answer their question by synthesizing information across ALL provided notes.

Formatting rules:
- Use **bold** for meeting names, key decisions, and important terms.
- Use bullet lists (- item) when listing insights or items from multiple meetings.
- Use numbered lists (1. item) for steps or priority-ordered information.
- Cite which meeting each insight came from using inline code (backticks) with the meeting name, e.g. \`Meeting — May 20\`. Do NOT use bold for citations.
- Use short paragraphs. Never write a wall of text.
- Do NOT use headers (##) for short answers.
- No filler phrases like "Based on the notes..." or "Certainly!".`;
  const notesText = notes.map((n) => `---\nMeeting: ${n.title} (${n.date})\n${n.content}\n---`).join("\n\n");
  const userPrompt = `## All Meeting Notes\n${notesText}\n\n## Question\n${query}`;
  return callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.primary, 0.3, 4000);
}

export async function suggestQuestions(transcript: string, notes: string): Promise<string[]> {
  const systemPrompt = `You are a meeting coach. Based on the meeting transcript and notes so far, suggest 3 insightful questions the user could ask next. Return ONLY a JSON array of strings.`;
  const userPrompt = `## Transcript so far
${transcript}

## Notes so far
${notes}

Suggest 3 questions.`;
  const response = await callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.primary, 0.5, 500);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return ["What are the next steps?", "Who is the decision maker on this?", "What is the deadline?"];
  }
}
