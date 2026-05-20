import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// DELETE /api/chat/clear?scope=all  OR  ?scope=<meetingId>
// Clears all chat messages for the given scope
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = req.nextUrl.searchParams.get("scope") ?? "all";

  await db
    .delete(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        scope === "all"
          ? isNull(chatMessages.meetingId)
          : eq(chatMessages.meetingId, scope)
      )
    );

  return NextResponse.json({ success: true });
}
