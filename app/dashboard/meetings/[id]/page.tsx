import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NoteEditor } from "@/components/note-editor";
import { EnhancedView } from "@/components/enhanced-view";
import { AIChat } from "@/components/ai-chat";
import { ChatDrawer } from "@/components/chat-drawer";
import { formatDate, formatDuration } from "@/lib/utils";
import { ArrowLeft, Clock, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ id: string }>; }

export default async function MeetingPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
    .limit(1);

  if (!meeting) notFound();

  // Get all meetings for the AI chat scope selector
  const allMeetings = await db
    .select({ id: meetings.id, title: meetings.title })
    .from(meetings)
    .where(eq(meetings.userId, userId))
    .orderBy(desc(meetings.createdAt));

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to meetings
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">{meeting.title}</h1>
          <div className="flex items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(meeting.createdAt)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(meeting.durationSeconds)}</span>
            {meeting.isEnhanced && <span className="bg-granola-200 text-granola-800 px-2 py-0.5 rounded-full text-xs font-medium">Enhanced</span>}
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">Your Notes</h2>
            <NoteEditor meeting={meeting} />
          </section>

          {meeting.isEnhanced && meeting.enhancedNotes && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider">Enhanced Summary</h2>
                <img src="/note.png" alt="AI" className="w-4 h-4 object-contain opacity-70" />
              </div>
              <EnhancedView content={meeting.enhancedNotes} />
            </section>
          )}

          {meeting.transcript && (
            <section>
              <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">Transcript</h2>
              <div className="bg-white rounded-xl border border-granola-200 p-6 max-h-96 overflow-auto">
                <div className="space-y-3">
                  {meeting.transcript.split("\n").map((line, i) => {
                    if (!line.trim()) return null;
                    const isSpeaker = line.match(/^Speaker \d+:/);
                    return <p key={i} className={`text-sm leading-relaxed ${isSpeaker ? "text-ink-800 font-medium" : "text-ink-500"}`}>{line}</p>;
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* AI Chat Sidebar — always visible on xl+ */}
      <div className="w-96 border-l border-granola-200 bg-granola-50/50 hidden xl:flex xl:flex-col p-4">
        <AIChat meetings={allMeetings} defaultScope={meeting.id} />
      </div>

      {/* Floating chat drawer for smaller screens — scoped to this meeting */}
      <ChatDrawer meetings={allMeetings} defaultScope={meeting.id} />
    </div>
  );
}
