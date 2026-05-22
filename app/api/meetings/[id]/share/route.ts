import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateShareToken, getShareUrl } from "@/lib/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
    .limit(1);

  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!meeting.isEnhanced || !meeting.enhancedNotes) {
    return NextResponse.json({ error: "Enhance this meeting before sharing" }, { status: 400 });
  }

  const token = meeting.shareToken ?? generateShareToken();

  const [updated] = await db
    .update(meetings)
    .set({ shareToken: token, updatedAt: new Date() })
    .where(eq(meetings.id, id))
    .returning({ shareToken: meetings.shareToken });

  const shareToken = updated?.shareToken ?? token;

  return NextResponse.json({
    token: shareToken,
    url: getShareUrl(shareToken),
  });
}
