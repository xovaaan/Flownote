import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings, chatMessages } from "@/db/schema";
import { eq, and, desc, isNull, asc } from "drizzle-orm";
import { askMeetingQuestion, suggestQuestions, searchAcrossNotes } from "@/lib/openrouter";

// GET /api/chat?scope=all  OR  ?scope=<meetingId>
// Returns stored chat messages for the given scope
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = req.nextUrl.searchParams.get("scope") ?? "all";

  const rows = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        scope === "all"
          ? isNull(chatMessages.meetingId)
          : eq(chatMessages.meetingId, scope)
      )
    )
    .orderBy(asc(chatMessages.createdAt));

  return NextResponse.json(rows);
}

// POST /api/chat — send a message, get AI reply, persist both
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meetingId, message, type, scope } = await req.json();

  // scope can be "all" or a specific meeting ID
  const chatScope: string = scope || meetingId || "all";
  const scopedMeetingId = chatScope === "all" ? null : chatScope;

  try {
    // ── Suggestions (not persisted) ────────────────────────────────
    if (type === "suggest") {
      if (chatScope === "all") {
        const allMeetings = await db
          .select()
          .from(meetings)
          .where(eq(meetings.userId, userId))
          .orderBy(desc(meetings.createdAt))
          .limit(5);
        const combinedTranscript = allMeetings.map((m) => m.transcript).join("\n\n");
        const combinedNotes = allMeetings.map((m) => m.rawNotes).join("\n\n");
        const questions = await suggestQuestions(combinedTranscript, combinedNotes);
        return NextResponse.json({ questions });
      } else {
        const [meeting] = await db
          .select()
          .from(meetings)
          .where(and(eq(meetings.id, chatScope), eq(meetings.userId, userId)))
          .limit(1);
        if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const questions = await suggestQuestions(meeting.transcript, meeting.rawNotes);
        return NextResponse.json({ questions });
      }
    }

    // ── Save user message ──────────────────────────────────────────
    await db.insert(chatMessages).values({
      userId,
      meetingId: scopedMeetingId,
      role: "user",
      content: message,
    });

    // ── Get AI answer ──────────────────────────────────────────────
    let answer: string;

    if (chatScope === "all") {
      const allMeetings = await db
        .select()
        .from(meetings)
        .where(eq(meetings.userId, userId))
        .orderBy(desc(meetings.createdAt));

      if (!allMeetings.length) {
        answer = "You don't have any meetings yet. Start recording one to build your knowledge base.";
      } else {
        const notes = allMeetings.map((m) => ({
          id: m.id,
          title: m.title,
          content: m.enhancedNotes || m.rawNotes || "",
          date: m.createdAt.toISOString(),
        }));
        answer = await searchAcrossNotes(message, notes);
      }
    } else {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(and(eq(meetings.id, chatScope), eq(meetings.userId, userId)))
        .limit(1);

      if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

      answer = await askMeetingQuestion(
        message,
        meeting.enhancedNotes || meeting.rawNotes || "",
        meeting.transcript || ""
      );
    }

    // ── Save assistant message ─────────────────────────────────────
    await db.insert(chatMessages).values({
      userId,
      meetingId: scopedMeetingId,
      role: "assistant",
      content: answer,
    });

    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Chat failed" }, { status: 500 });
  }
}
