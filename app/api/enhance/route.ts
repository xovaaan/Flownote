import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { enhanceNotes } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { meetingId } = await req.json();
  const [meeting] = await db.select().from(meetings).where(and(eq(meetings.id, meetingId), eq(meetings.userId, userId))).limit(1);
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const enhanced = await enhanceNotes(meeting.rawNotes, meeting.transcript);
    const [data] = await db.update(meetings).set({ enhancedNotes: enhanced, isEnhanced: true }).where(eq(meetings.id, meetingId)).returning();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Enhancement failed" }, { status: 500 });
  }
}
