"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { AIChat } from "@/components/ai-chat";
import { cn } from "@/lib/utils";

interface MeetingOption {
  id: string;
  title: string;
}

interface Props {
  meetings: MeetingOption[];
  defaultScope?: string;
}

export function ChatDrawer({ meetings, defaultScope = "all" }: Props) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Floating toggle button — hidden on xl where sidebar is always shown */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Chat"
        className="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-granola-800 text-granola-50 rounded-full shadow-xl flex items-center justify-center hover:bg-granola-900 transition-all hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "xl:hidden fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Slide-in drawer panel */}
      <div
        className={cn(
          "xl:hidden fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col bg-granola-50 shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-granola-200 bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-granola-600" />
            <span className="text-sm font-semibold text-ink-800">AI Chat</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-granola-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden p-3">
          <AIChat meetings={meetings} defaultScope={defaultScope} />
        </div>
      </div>
    </>
  );
}
