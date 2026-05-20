"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function NewMeetingButton() {
  return (
    <Link href="/dashboard/meetings/new"
      className="inline-flex items-center gap-2 bg-granola-800 text-granola-50 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-granola-900 transition-colors shadow-sm">
      <Plus className="w-4 h-4" />New Meeting
    </Link>
  );
}
