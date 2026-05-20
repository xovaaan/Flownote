import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings, searchLogs } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch meetings from the last 30 days
    const recentMeetings = await db
      .select({
        id: meetings.id,
        createdAt: meetings.createdAt,
        rawNotes: meetings.rawNotes,
        enhancedNotes: meetings.enhancedNotes,
        transcript: meetings.transcript,
      })
      .from(meetings)
      .where(and(eq(meetings.userId, userId), gte(meetings.createdAt, thirtyDaysAgo)));

    // 2. Fetch searches from the last 30 days
    const recentSearches = await db
      .select({
        id: searchLogs.id,
        createdAt: searchLogs.createdAt,
      })
      .from(searchLogs)
      .where(and(eq(searchLogs.userId, userId), gte(searchLogs.createdAt, thirtyDaysAgo)));

    // Aggregate stats
    let totalWords = 0;
    let totalCharacters = 0;

    // Daily activity data for chart
    const dailyData: Record<string, { date: string; meetings: number; searches: number; words: number }> = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyData[dateStr] = { date: dateStr, meetings: 0, searches: 0, words: 0 };
    }

    recentMeetings.forEach(m => {
      const text = `${m.rawNotes} ${m.enhancedNotes || ""} ${m.transcript}`;
      const words = text.split(/\s+/).filter(w => w.length > 0).length;
      totalWords += words;
      totalCharacters += text.length;

      const dateStr = new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyData[dateStr]) {
        dailyData[dateStr].meetings += 1;
        dailyData[dateStr].words += words;
      }
    });

    recentSearches.forEach(s => {
      const dateStr = new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyData[dateStr]) {
        dailyData[dateStr].searches += 1;
      }
    });

    const chartData = Object.values(dailyData);

    return NextResponse.json({
      totalMeetings: recentMeetings.length,
      totalSearches: recentSearches.length,
      totalWords,
      totalCharacters,
      chartData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
