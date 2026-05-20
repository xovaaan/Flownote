import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MeetingCard } from "@/components/meeting-card";
import { SearchBar } from "@/components/search-bar";
import { NewMeetingButton } from "@/components/new-meeting-button";
import { AIChat } from "@/components/ai-chat";
import { ChatDrawer } from "@/components/chat-drawer";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, userId))
    .orderBy(desc(meetings.createdAt));

  const recentMeetings = userMeetings.slice(0, 5);
  const totalMeetings = userMeetings.length;
  const enhancedCount = userMeetings.filter((m) => m.isEnhanced).length;

  const meetingOptions = userMeetings.map((m) => ({ id: m.id, title: m.title }));

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Your Meetings</h1>
            <p className="text-ink-500 mt-1">{totalMeetings} meeting{totalMeetings !== 1 ? "s" : ""} · {enhancedCount} enhanced</p>
          </div>
          <NewMeetingButton />
        </div>

        <SearchBar />

        <section>
          <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-4">Recent</h2>
          {recentMeetings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-granola-200 p-12 text-center">
              <div className="w-16 h-16 bg-granola-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🎙️</span></div>
              <h3 className="text-lg font-semibold text-ink-800 mb-2">No meetings yet</h3>
              <p className="text-ink-500 max-w-sm mx-auto mb-6">Start your first meeting to begin capturing notes and transcripts. Everything stays private to your account.</p>
              <NewMeetingButton />
            </div>
          ) : (
            <div className="grid gap-3">
              {recentMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}
            </div>
          )}
        </section>

        {userMeetings.length > 5 && (
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-4">All Meetings</h2>
            <div className="grid gap-3">
              {userMeetings.slice(5).map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}
            </div>
          </section>
        )}
      </div>

      {/* AI Chat Sidebar — always visible on xl+ */}
      <div className="w-96 border-l border-granola-200 bg-granola-50/50 hidden xl:flex xl:flex-col p-4">
        <AIChat meetings={meetingOptions} defaultScope="all" />
      </div>

      {/* Floating chat drawer for smaller screens */}
      <ChatDrawer meetings={meetingOptions} defaultScope="all" />
    </div>
  );
}
