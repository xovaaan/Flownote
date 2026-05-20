"use client";

import Link from "next/link";
import { Meeting } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";
import { Sparkles, Clock } from "lucide-react";

interface Props { meeting: Meeting; }

export function MeetingCard({ meeting }: Props) {
  return (
    <Link href={`/dashboard/meetings/${meeting.id}`}
      className="group bg-white rounded-xl border border-granola-200 p-5 hover:border-granola-400 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-ink-800 group-hover:text-granola-800 transition-colors truncate">{meeting.title}</h3>
            {meeting.isEnhanced && <img src="/note.png" alt="AI Enhanced" className="w-3.5 h-3.5 object-contain opacity-70 flex-shrink-0" />}
          </div>
          <p className="text-sm text-ink-400 line-clamp-2">
            {meeting.rawNotes ? meeting.rawNotes.slice(0, 120) + "..." : "No notes yet"}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-400 ml-4 flex-shrink-0">
          <Clock className="w-3 h-3" />{formatDuration(meeting.durationSeconds)}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-ink-400">
        <span>{formatDate(meeting.createdAt)}</span>
        {meeting.folder && <span className="bg-granola-100 text-granola-700 px-2 py-0.5 rounded-full">{meeting.folder}</span>}
      </div>
    </Link>
  );
}
