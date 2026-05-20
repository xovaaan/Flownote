"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Sparkles, Loader2, Lightbulb, ChevronDown,
  MessageSquare, Trash2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "@/components/markdown-message";

interface MeetingOption {
  id: string;
  title: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  meetings: MeetingOption[];
  defaultScope?: "all" | string;
}

export function AIChat({ meetings, defaultScope = "all" }: Props) {
  const [scope, setScope] = useState<string>(defaultScope);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load persisted history whenever scope changes
  const loadHistory = useCallback(async (currentScope: string) => {
    setLoadingHistory(true);
    setSuggestions([]);
    try {
      const res = await fetch(`/api/chat?scope=${currentScope}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
      }
    } catch {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(scope);
  }, [scope, loadHistory]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "suggest", scope }),
      });
      const data = await res.json();
      setSuggestions(data.questions || []);
    } catch {
      setSuggestions([
        "What are my key action items across all meetings?",
        "Summarize my last 3 meetings",
        "What deadlines are coming up?",
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const tempId = Date.now().toString();
    const userMsg: Message = { id: tempId, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, scope }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I couldn't find an answer.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!confirm("Clear all messages in this chat?")) return;
    setClearing(true);
    try {
      await fetch(`/api/chat/clear?scope=${scope}`, { method: "DELETE" });
      setMessages([]);
      setSuggestions([]);
    } finally {
      setClearing(false);
    }
  };

  const changeScope = (newScope: string) => {
    setScope(newScope);
    setIsDropdownOpen(false);
    setMessages([]);
    setSuggestions([]);
  };

  const selectedMeeting = meetings.find((m) => m.id === scope);
  const scopeLabel = scope === "all" ? "All Meetings" : selectedMeeting?.title || "Select meeting...";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-granola-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-granola-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-granola-600" />
            <h3 className="text-sm font-semibold text-ink-800">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => loadHistory(scope)}
              disabled={loadingHistory}
              title="Reload history"
              className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-granola-100 rounded-lg transition-colors disabled:opacity-40"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loadingHistory && "animate-spin")} />
            </button>
            <button
              onClick={clearChat}
              disabled={clearing || messages.length === 0}
              title="Clear chat"
              className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scope Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-granola-50 border border-granola-200 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-granola-100 transition-colors"
          >
            <span className="truncate">{scopeLabel}</span>
            <ChevronDown className={cn("w-4 h-4 text-ink-400 flex-shrink-0 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-granola-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              <button
                onClick={() => changeScope("all")}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  scope === "all" ? "bg-granola-100 text-granola-900 font-medium" : "text-ink-600 hover:bg-granola-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <img src="/note.png" alt="AI" className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-70" />
                  All Meetings
                </div>
              </button>
              {meetings.length > 0 && <div className="border-t border-granola-100 my-1" />}
              {meetings.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => changeScope(meeting.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    scope === meeting.id ? "bg-granola-100 text-granola-900 font-medium" : "text-ink-600 hover:bg-granola-50"
                  )}
                >
                  <div className="truncate">{meeting.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="flex flex-col gap-3 animate-pulse pt-4">
            <div className="flex justify-end"><div className="h-8 w-48 bg-granola-200 rounded-xl" /></div>
            <div className="flex justify-start"><div className="h-12 w-56 bg-granola-100 rounded-xl" /></div>
            <div className="flex justify-end"><div className="h-8 w-32 bg-granola-200 rounded-xl" /></div>
            <div className="flex justify-start"><div className="h-16 w-60 bg-granola-100 rounded-xl" /></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-granola-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-5 h-5 text-granola-600" />
            </div>
            <p className="text-sm text-ink-500 mb-4">
              {scope === "all"
                ? "Ask anything across all your meetings"
                : `Ask anything about "${selectedMeeting?.title}"`}
            </p>
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left text-xs text-ink-600 bg-granola-50 hover:bg-granola-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    {q}
                  </button>
                ))
              ) : (
                <button
                  onClick={loadSuggestions}
                  disabled={loadingSuggestions}
                  className="text-xs text-granola-600 hover:text-granola-800 font-medium disabled:opacity-50"
                >
                  {loadingSuggestions ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading suggestions...
                    </span>
                  ) : (
                    "✨ Get suggestions"
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed bg-granola-800 text-granola-50">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[85%] rounded-xl px-4 py-3 bg-granola-100 text-ink-700">
                  <MarkdownMessage content={msg.content} />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-granola-100 rounded-xl px-3 py-2 text-sm text-ink-500 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-granola-200">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={scope === "all" ? "Ask across all meetings..." : "Ask about this meeting..."}
            className="flex-1 bg-granola-50 border border-granola-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-9 h-9 bg-granola-800 text-granola-50 rounded-lg flex items-center justify-center hover:bg-granola-900 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {messages.length > 0 && (
          <p className="text-xs text-ink-300 text-center mt-2">
            {messages.length} message{messages.length !== 1 ? "s" : ""} · History saved
          </p>
        )}
      </div>
    </div>
  );
}
