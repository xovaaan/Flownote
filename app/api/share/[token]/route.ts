import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { token } = await params;

  const [meeting] = await db
    .select({
      title: meetings.title,
      enhancedNotes: meetings.enhancedNotes,
      isEnhanced: meetings.isEnhanced,
      createdAt: meetings.createdAt,
    })
    .from(meetings)
    .where(eq(meetings.shareToken, token))
    .limit(1);

  if (!meeting?.isEnhanced || !meeting.enhancedNotes) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(meeting);
}
