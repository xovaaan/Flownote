import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [data] = await db
      .insert(meetings)
      .values({
        userId,
        title: body.title || "Untitled Meeting",
        rawNotes: body.raw_notes || "",
        transcript: body.transcript || "",
        durationSeconds: body.duration_seconds || 0,
        folder: body.folder || null,
      })
      .returning();

    if (!data) {
      return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/meetings error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save meeting" },
      { status: 500 }
    );
  }
}
