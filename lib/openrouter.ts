const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY;

const MODELS = {
  primary: "nvidia/nemotron-3-super-120b-a12b:free",
  fallback: "nvidia/nemotron-nano-2-vl:free",
  auto: "openrouter/router",
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
  const systemPrompt = `You are an expert meeting note enhancer. Your job is to take raw user notes and a transcript, then produce a beautifully structured, scannable meeting summary.

Rules:
- Preserve the user's original emphasis and intent. Mark AI-generated additions distinctly.
- Use markdown: headers, bullet lists, bold for key terms, blockquotes for direct quotes.
- Extract clear Action Items with assignees (if mentioned) and deadlines.
- Add a "Key Decisions" section.
- Add a "Follow-ups" section.
- Keep the tone professional but warm.
- If the user wrote something in their raw notes, keep it verbatim unless it needs grammatical fixing.
- Output ONLY the enhanced notes in markdown. No preamble.`;

  const userPrompt = `## Raw User Notes
${rawNotes || "(No raw notes provided)"}

## Transcript
${transcript || "(No transcript provided)"}

Please enhance these meeting notes.`;

  try {
    return await callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.primary, 0.3, 4000);
  } catch {
    return callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.auto, 0.3, 4000);
  }
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
  const response = await callOpenRouter([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], MODELS.fallback, 0.5, 500);
  try {
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return ["What are the next steps?", "Who is the decision maker on this?", "What is the deadline?"];
  }
}
