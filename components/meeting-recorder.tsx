"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Pause, Play, Sparkles, Loader2, Wand2 } from "lucide-react";
import { cn, generateMeetingTitle } from "@/lib/utils";

export function MeetingRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Browser doesn't support speech recognition. Use Chrome/Edge."); return null; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t + " "; else interim += t;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") { setPermissionDenied(true); setIsRecording(false); }
    };
    recognition.onend = () => { if (isRecording && !isPaused) recognition.start(); };
    return recognition;
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true); setIsPaused(false); setPermissionDenied(false);
      if (!title) setTitle(generateMeetingTitle());
      timerRef.current = setInterval(() => { durationRef.current += 1; setDuration(durationRef.current); }, 1000);
      const recognition = initSpeechRecognition();
      if (recognition) { recognitionRef.current = recognition; recognition.start(); }
    } catch { setPermissionDenied(true); }
  };

  const pauseRecording = () => { setIsPaused(true); if (recognitionRef.current) recognitionRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current); };
  const resumeRecording = () => { setIsPaused(false); timerRef.current = setInterval(() => { durationRef.current += 1; setDuration(durationRef.current); }, 1000); if (recognitionRef.current) recognitionRef.current.start(); };
  const stopRecording = () => { setIsRecording(false); setIsPaused(false); if (recognitionRef.current) recognitionRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current); };

  const saveMeeting = async (withEnhance = false) => {
    setSaving(true);
    try {
      const res = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title || generateMeetingTitle(), raw_notes: rawNotes, transcript: transcript + interimTranscript, duration_seconds: duration }) });
      const data = await res.json();
      if (data.id) {
        if (withEnhance && (transcript || rawNotes)) {
          setEnhancing(true);
          await fetch("/api/enhance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: data.id }) });
          setEnhancing(false);
        }
        router.push(`/dashboard/meetings/${data.id}`);
      }
    } catch { alert("Failed to save meeting"); }
    finally { setSaving(false); }
  };

  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60), s = seconds % 60; return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`; };

  return (
    <div className="space-y-6">
      {permissionDenied && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">Microphone access denied. Allow microphone access in browser settings.</div>}

      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Meeting Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={generateMeetingTitle()} className="w-full bg-white border border-granola-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400" />
      </div>

      {/* Auto-enhance toggle */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-granola-200 p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-granola-600" />
            <span className="text-sm font-medium text-ink-700">Auto-Enhance with AI</span>
          </div>
          <p className="text-xs text-ink-400 mt-0.5">Automatically generate structured summary when you save</p>
        </div>
        <button
          onClick={() => setAutoEnhance(!autoEnhance)}
          className={cn("relative w-11 h-6 rounded-full transition-colors", autoEnhance ? "bg-granola-700" : "bg-granola-300")}
        >
          <span className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", autoEnhance ? "translate-x-5" : "translate-x-0")} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-granola-200 p-8 text-center">
        <div className="mb-6">
          <div className={cn("text-4xl font-mono font-bold tracking-tight", isRecording ? "text-red-500" : "text-ink-400")}>{formatTime(duration)}</div>
          {isRecording && <div className="flex items-center justify-center gap-2 mt-2"><div className="w-2 h-2 bg-red-500 rounded-full recording-pulse" /><span className="text-sm text-red-500 font-medium">Recording</span></div>}
        </div>
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button onClick={startRecording} className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"><Mic className="w-7 h-7" /></button>
          ) : (
            <>
              {isPaused ? (
                <button onClick={resumeRecording} className="w-14 h-14 bg-granola-700 hover:bg-granola-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"><Play className="w-6 h-6 ml-0.5" /></button>
              ) : (
                <button onClick={pauseRecording} className="w-14 h-14 bg-ink-700 hover:bg-ink-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"><Pause className="w-6 h-6" /></button>
              )}
              <button onClick={stopRecording} className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"><Square className="w-6 h-6" /></button>
            </>
          )}
        </div>
        <p className="text-xs text-ink-400 mt-4">{isRecording ? "Transcribing from your microphone..." : "Click the mic to start capturing your meeting"}</p>
      </div>

      {(transcript || interimTranscript) && (
        <div className="bg-white rounded-xl border border-granola-200 p-4">
          <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Live Transcript</h3>
          <div className="text-sm text-ink-600 leading-relaxed max-h-48 overflow-auto">{transcript}<span className="text-ink-400">{interimTranscript}</span></div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Your Notes</label>
        <textarea value={rawNotes} onChange={(e) => setRawNotes(e.target.value)} placeholder="Jot down your thoughts, key points, action items..." rows={8}
          className="w-full bg-white border border-granola-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400 resize-none font-mono leading-relaxed" />
      </div>

      {/* Save buttons with enhance option */}
      <div className="flex justify-end gap-3">
        <button onClick={() => saveMeeting(false)} disabled={saving || enhancing || (!transcript && !rawNotes)}
          className="inline-flex items-center gap-2 bg-white border border-granola-300 text-ink-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-granola-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <>Save Only</>}
        </button>
        <button onClick={() => saveMeeting(true)} disabled={saving || enhancing || (!transcript && !rawNotes)}
          className="inline-flex items-center gap-2 bg-granola-800 text-granola-50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-granola-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {enhancing ? <><Loader2 className="w-4 h-4 animate-spin" />Enhancing...</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><img src="/note.png" alt="AI" className="w-4 h-4 object-contain brightness-0 invert" />Save & Enhance</>}
        </button>
      </div>
    </div>
  );
}
