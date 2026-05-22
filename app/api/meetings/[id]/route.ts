import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { normalizeEnhancedHtml } from "@/lib/enhanced-html";

interface Props { params: Promise<{ id: string }>; }

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [data] = await db.select().from(meetings).where(and(eq(meetings.id, id), eq(meetings.userId, userId))).limit(1);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Partial<{
    title: string;
    rawNotes: string;
    enhancedNotes: string;
    transcript: string;
    durationSeconds: number;
    folder: string | null;
    isEnhanced: boolean;
    updatedAt: Date;
  }> = { updatedAt: new Date() };

  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.rawNotes === "string") updates.rawNotes = body.rawNotes;
  if (typeof body.enhancedNotes === "string") {
    updates.enhancedNotes = normalizeEnhancedHtml(body.enhancedNotes);
    updates.isEnhanced = true;
  }
  if (typeof body.transcript === "string") updates.transcript = body.transcript;
  if (typeof body.durationSeconds === "number") updates.durationSeconds = body.durationSeconds;
  if (body.folder === null || typeof body.folder === "string") updates.folder = body.folder;
  if (typeof body.isEnhanced === "boolean") updates.isEnhanced = body.isEnhanced;

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const [data] = await db
      .update(meetings)
      .set(updates)
      .where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
      .returning();
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/meetings/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.delete(meetings).where(and(eq(meetings.id, id), eq(meetings.userId, userId)));
  return NextResponse.json({ success: true });
}
