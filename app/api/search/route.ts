import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings, searchLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { searchAcrossNotes } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { query } = await req.json();
  const userMeetings = await db
    .select({ id: meetings.id, title: meetings.title, rawNotes: meetings.rawNotes, enhancedNotes: meetings.enhancedNotes, createdAt: meetings.createdAt })
    .from(meetings)
    .where(eq(meetings.userId, userId))
    .orderBy(desc(meetings.createdAt));

  if (!userMeetings.length) {
    return NextResponse.json({ answer: "You don't have any meetings yet. Start recording one to build your knowledge base.", sources: [] });
  }

  const notes = userMeetings.map((m) => ({
    id: m.id,
    title: m.title,
    content: m.enhancedNotes
      ? m.enhancedNotes.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : m.rawNotes || "",
    date: new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
  }));

  try {
    // Log the search for analytics
    await db.insert(searchLogs).values({ userId, query });

    const answer = await searchAcrossNotes(query, notes);
    return NextResponse.json({ answer, sources: notes.map((n) => n.title) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
