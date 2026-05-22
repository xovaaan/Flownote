import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EnhancedSummary } from "@/components/enhanced-summary";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharedMeetingPage({ params }: Props) {
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

  if (!meeting?.isEnhanced || !meeting.enhancedNotes) notFound();

  return (
    <div className="min-h-screen bg-granola-50">
      <header className="border-b border-granola-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/note.png" alt="Flownote" className="w-6 h-6 object-contain" />
            <span className="font-bold text-lg text-ink-950">Flownote</span>
          </Link>
          <span className="text-xs font-medium text-ink-400 uppercase tracking-wider">Shared summary</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">{meeting.title}</h1>
          <p className="text-sm text-ink-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(meeting.createdAt)}
          </p>
        </div>

        <EnhancedSummary content={meeting.enhancedNotes} />
      </main>
    </div>
  );
}
