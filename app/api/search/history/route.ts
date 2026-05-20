import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { searchLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const history = await db
      .select({
        id: searchLogs.id,
        query: searchLogs.query,
        createdAt: searchLogs.createdAt,
      })
      .from(searchLogs)
      .where(eq(searchLogs.userId, userId))
      .orderBy(desc(searchLogs.createdAt))
      .limit(20);

    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch history" }, { status: 500 });
  }
}
