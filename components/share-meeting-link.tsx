"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2 } from "lucide-react";

interface Props {
  meetingId: string;
  initialUrl?: string | null;
}

export function ShareMeetingLink({ meetingId, initialUrl }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/share`, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create link");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!url) {
      await generateLink();
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — select the link and copy manually");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-granola-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-granola-600" />
        <span className="text-sm font-semibold text-ink-800">Share enhanced summary</span>
      </div>
      <p className="text-xs text-ink-500">
        Anyone with the link can view this enhanced summary — no account required.
      </p>

      {url ? (
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 text-xs bg-granola-50 border border-granola-200 rounded-lg px-3 py-2 text-ink-700 font-mono truncate"
          />
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 shrink-0 bg-granola-800 text-granola-50 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-granola-900 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={generateLink}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-granola-800 text-granola-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-granola-900 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating link…
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" /> Generate share link
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
