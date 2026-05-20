"use client";

import { useState, useRef, useEffect } from "react";
import { Meeting } from "@/types";
import { Send, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message { id: string; role: "user" | "assistant"; content: string; }
interface Props { meeting: Meeting; }

export function MeetingChat({ meeting }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id, type: "suggest" }) });
      const data = await res.json();
      setSuggestions(data.questions || []);
    } catch {
      setSuggestions(["What are the key decisions?", "What action items came up?", "Who needs to follow up?"]);
    } finally { setLoadingSuggestions(false); }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id, message: text }) });
      const data = await res.json();
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.answer || "I couldn't find an answer in this meeting." };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again." };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-granola-200">
        <h3 className="text-sm font-semibold text-ink-800 flex items-center gap-2"><img src="/note.png" alt="AI" className="w-4 h-4 object-contain opacity-70" />Meeting Assistant</h3>
        <p className="text-xs text-ink-400 mt-0.5">Ask anything about this meeting</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-granola-100 rounded-xl flex items-center justify-center mx-auto mb-3"><Lightbulb className="w-5 h-5 text-granola-600" /></div>
            <p className="text-sm text-ink-500 mb-4">Ask questions like:</p>
            <div className="space-y-2">
              {suggestions.length > 0 ? suggestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="block w-full text-left text-xs text-ink-600 bg-granola-50 hover:bg-granola-100 px-3 py-2 rounded-lg transition-colors">{q}</button>
              )) : (
                <button onClick={loadSuggestions} disabled={loadingSuggestions} className="text-xs text-granola-600 hover:text-granola-800 font-medium">{loadingSuggestions ? "Loading..." : "Get suggestions"}</button>
              )}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", msg.role === "user" ? "bg-granola-800 text-granola-50" : "bg-granola-100 text-ink-700")}>{msg.content}</div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-granola-100 rounded-xl px-3 py-2 text-sm text-ink-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Thinking...</div></div>}
      </div>
      <div className="p-4 border-t border-granola-200">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this meeting..." className="flex-1 bg-granola-50 border border-granola-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400" />
          <button type="submit" disabled={loading || !input.trim()} className="w-9 h-9 bg-granola-800 text-granola-50 rounded-lg flex items-center justify-center hover:bg-granola-900 transition-colors disabled:opacity-50"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
