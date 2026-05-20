"use client";

import { useState } from "react";
import { Meeting } from "@/types";
import { Sparkles, Save, Loader2, Wand2 } from "lucide-react";

interface Props { meeting: Meeting; }

export function NoteEditor({ meeting }: Props) {
  const [notes, setNotes] = useState(meeting.rawNotes || "");
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await fetch(`/api/meetings/${meeting.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawNotes: notes }) });
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) { console.error("Save failed:", err); }
    finally { setSaving(false); }
  };

  const enhanceNotes = async () => {
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id }) });
      const data = await res.json();
      if (data.enhancedNotes || data.isEnhanced) window.location.reload();
    } catch (err) { console.error("Enhance failed:", err); alert("Failed to enhance notes. Try again."); }
    finally { setEnhancing(false); }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-granola-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-granola-100 bg-granola-50/50">
          <span className="text-xs font-medium text-ink-400">{lastSaved ? `Saved at ${lastSaved}` : "Unsaved changes"}</span>
          <div className="flex items-center gap-2">
            <button onClick={saveNotes} disabled={saving} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 px-2 py-1 rounded-md hover:bg-granola-100 transition-colors">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
            </button>
            {!meeting.isEnhanced && (
              <button onClick={enhanceNotes} disabled={enhancing} className="inline-flex items-center gap-1.5 text-xs font-medium bg-granola-800 text-granola-50 px-3 py-1 rounded-md hover:bg-granola-900 transition-colors">
                {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}Enhance with AI
              </button>
            )}
          </div>
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Your raw notes..." rows={12}
          className="w-full px-4 py-3 text-sm focus:outline-none resize-none font-mono leading-relaxed text-ink-800" />
      </div>

      {/* Enhancement info banner */}
      {meeting.isEnhanced && (
        <div className="flex items-center gap-2 text-xs text-granola-600 bg-granola-100 rounded-lg px-3 py-2">
          <img src="/note.png" alt="AI" className="w-3.5 h-3.5 object-contain opacity-80" />
          This meeting has been enhanced with AI. Scroll down to see the structured summary.
        </div>
      )}
    </div>
  );
}
