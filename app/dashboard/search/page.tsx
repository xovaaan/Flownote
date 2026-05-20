"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, X, Clock, Loader2, ArrowRight } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";
import { formatDate } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/search/history");
      const data = await res.json();
      setHistory(data);
    } catch {
      // Handle error silently
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: searchQuery }) });
      const data = await res.json();
      setAnswer(data.answer || data.error || "No answer found.");
      loadHistory(); // Refresh history
    } catch {
      setAnswer("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="flex h-full">
      {/* Main Search Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900 mb-2">Search</h1>
            <p className="text-ink-500">Ask questions across all your meetings. AI will synthesize answers from your entire knowledge base.</p>
          </div>

          <form onSubmit={onSubmit} className="relative shadow-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., What are the most common feature requests from Q1?"
              className="w-full bg-white border border-granola-200 rounded-xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-granola-400 focus:border-transparent transition-all" />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setAnswer(""); setHasSearched(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 bg-granola-100 p-1 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {hasSearched && (
            <div className="bg-white rounded-xl border border-granola-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <img src="/note.png" alt="AI" className="w-4 h-4 object-contain opacity-70" />
                <span className="text-sm font-medium text-ink-700">AI Answer</span>
              </div>
              {loading ? (
                <div className="flex items-center gap-3 text-ink-500 py-8">
                  <div className="w-5 h-5 border-2 border-granola-400 border-t-transparent rounded-full animate-spin" />
                  Searching across your meetings...
                </div>
              ) : (
                <div className="max-w-none">
                  <MarkdownMessage content={answer} className="text-ink-700 text-base" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-80 border-l border-granola-200 bg-granola-50/50 hidden lg:flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-granola-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-granola-600" />
          <h2 className="font-semibold text-ink-900">Recent Searches</h2>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {loadingHistory ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-granola-400 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-sm text-ink-400 p-4">
              No recent searches
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSearch(item.query)}
                className="w-full text-left p-3 rounded-xl bg-white border border-granola-200 hover:border-granola-300 hover:shadow-sm transition-all group"
              >
                <div className="text-sm font-medium text-ink-800 line-clamp-2 leading-snug mb-1">
                  "{item.query}"
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-ink-400">
                    {formatDate(item.createdAt)}
                  </div>
                  <ArrowRight className="w-3 h-3 text-granola-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
