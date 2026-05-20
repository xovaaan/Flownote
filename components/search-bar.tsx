"use client";

import { useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setIsOpen(true);
    try {
      const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const data = await res.json();
      setAnswer(data.answer || data.error || "No answer found.");
    } catch { setAnswer("Search failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search across all your meetings..."
          className="w-full bg-white border border-granola-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400 focus:border-transparent transition-all" />
        {query && <button type="button" onClick={() => { setQuery(""); setIsOpen(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"><X className="w-4 h-4" /></button>}
      </form>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-granola-200 shadow-xl p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><img src="/note.png" alt="AI" className="w-4 h-4 object-contain opacity-70" /><span className="text-sm font-medium text-ink-700">AI Search Result</span></div>
            <button onClick={() => setIsOpen(false)} className="text-ink-400 hover:text-ink-600"><X className="w-4 h-4" /></button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-ink-500"><div className="w-4 h-4 border-2 border-granola-400 border-t-transparent rounded-full animate-spin" />Searching across your meetings...</div>
          ) : (
            <div className="prose prose-stone max-w-none text-sm"><div className="whitespace-pre-wrap text-ink-700 leading-relaxed">{answer}</div></div>
          )}
        </div>
      )}
    </div>
  );
}
