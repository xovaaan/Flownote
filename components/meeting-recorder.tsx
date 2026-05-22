"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Pause, Play, Loader2, Wand2 } from "lucide-react";
import { cn, generateMeetingTitle } from "@/lib/utils";

// Send audio to Groq every N seconds while user keeps speaking (no pause needed)
const SEGMENT_INTERVAL_MS = 6000;

/** Merge new segment, trimming duplicate words at chunk boundaries */
function appendTranscript(existing: string, segment: string): string {
  const seg = segment.trim();
  if (!seg) return existing;
  if (!existing) return seg;

  const existingWords = existing.split(/\s+/);
  const segWords = seg.split(/\s+/);
  const maxOverlap = Math.min(8, existingWords.length, segWords.length);

  for (let i = maxOverlap; i > 0; i--) {
    const tail = existingWords.slice(-i).join(" ").toLowerCase();
    const head = segWords.slice(0, i).join(" ").toLowerCase();
    if (tail === head) {
      const rest = segWords.slice(i).join(" ");
      return rest ? `${existing} ${rest}` : existing;
    }
  }

  return `${existing} ${seg}`;
}

/** Whisper may echo the prompt — strip overlap with recent transcript */
function stripPromptEcho(segment: string, context: string): string {
  let seg = segment.trim();
  if (!seg || !context) return seg;

  const ctx = context.trim();
  if (seg.toLowerCase() === ctx.toLowerCase()) return "";

  for (const len of [120, 80, 50, 30]) {
    const tail = ctx.slice(-len).trim();
    if (tail.length > 10 && seg.toLowerCase().startsWith(tail.toLowerCase())) {
      seg = seg.slice(tail.length).trim();
      break;
    }
  }

  return seg;
}

export function MeetingRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const router = useRouter();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const segmentIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(0);
  const transcribeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const activeTranscriptionsRef = useRef(0);
  const transcriptRef = useRef("");
  const shouldRestartRecorderRef = useRef(false);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, isTranscribing]);

  const appendSegment = useCallback((text: string) => {
    setTranscript((prev) => {
      const next = appendTranscript(prev, text);
      transcriptRef.current = next;
      return next;
    });
  }, []);

  const transcribeChunk = useCallback(
    async (blob: Blob, retry = 0): Promise<void> => {
      if (blob.size < 800) return;

      activeTranscriptionsRef.current += 1;
      setIsTranscribing(true);
      setTranscribeError(null);

      try {
        const formData = new FormData();
        formData.append("audio", blob, "segment.webm");
        const tail = transcriptRef.current.slice(-400);
        if (tail) formData.append("prompt", tail);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          if (retry < 2) {
            await new Promise((r) => setTimeout(r, 800));
            return transcribeChunk(blob, retry + 1);
          }
          throw new Error(data.error || "Transcription failed");
        }

        if (data.text) {
          const cleaned = stripPromptEcho(data.text, tail);
          if (cleaned) appendSegment(cleaned);
        }
      } catch (error) {
        setTranscribeError(error instanceof Error ? error.message : "Transcription failed");
      } finally {
        activeTranscriptionsRef.current -= 1;
        if (activeTranscriptionsRef.current === 0) setIsTranscribing(false);
      }
    },
    [appendSegment]
  );

  const queueTranscribe = useCallback(
    (blob: Blob) => {
      transcribeQueueRef.current = transcribeQueueRef.current.then(() => transcribeChunk(blob));
    },
    [transcribeChunk]
  );

  const getMimeType = () => {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    return "audio/webm";
  };

  const clearSegmentInterval = () => {
    if (segmentIntervalRef.current) {
      clearInterval(segmentIntervalRef.current);
      segmentIntervalRef.current = null;
    }
  };

  const rotateSegment = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    shouldRestartRecorderRef.current = true;
    recorder.stop();
  }, []);

  const startMediaRecorder = useCallback(
    (stream: MediaStream) => {
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) queueTranscribe(event.data);
      };

      recorder.onstop = () => {
        if (
          shouldRestartRecorderRef.current &&
          isRecordingRef.current &&
          !isPausedRef.current &&
          streamRef.current
        ) {
          shouldRestartRecorderRef.current = false;
          startMediaRecorder(streamRef.current);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    },
    [queueTranscribe]
  );

  const startSegmentInterval = useCallback(() => {
    clearSegmentInterval();
    segmentIntervalRef.current = setInterval(rotateSegment, SEGMENT_INTERVAL_MS);
  }, [rotateSegment]);

  const stopRecorder = (releaseStream: boolean) => {
    clearSegmentInterval();
    shouldRestartRecorderRef.current = false;

    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;

    if (releaseStream) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      setIsPaused(false);
      isRecordingRef.current = true;
      isPausedRef.current = false;
      setPermissionDenied(false);
      setTranscribeError(null);
      if (!title) setTitle(generateMeetingTitle());

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);

      startMediaRecorder(stream);
      startSegmentInterval();
    } catch {
      setPermissionDenied(true);
    }
  };

  const pauseRecording = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    clearSegmentInterval();
    rotateSegment();
  };

  const resumeRecording = () => {
    if (!streamRef.current) return;
    setIsPaused(false);
    isPausedRef.current = false;
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setDuration(durationRef.current);
    }, 1000);
    startMediaRecorder(streamRef.current);
    startSegmentInterval();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    isRecordingRef.current = false;
    isPausedRef.current = false;
    rotateSegment();
    stopRecorder(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const waitForTranscriptions = () => transcribeQueueRef.current;

  const saveMeeting = async (withEnhance = false) => {
    setSaving(true);
    setTranscribeError(null);
    try {
      await waitForTranscriptions();

      const res = await fetch("/api/meetings", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: title || generateMeetingTitle(),
          raw_notes: rawNotes,
          transcript,
          duration_seconds: duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Save failed (${res.status})`);
      }
      if (!data.id) {
        throw new Error("Save failed: no meeting id returned");
      }

      if (withEnhance && (transcript || rawNotes)) {
        setEnhancing(true);
        const enhanceRes = await fetch("/api/enhance", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ meetingId: data.id }),
        });
        const enhanceData = await enhanceRes.json();
        if (!enhanceRes.ok) {
          throw new Error(enhanceData.error || `Enhancement failed (${enhanceRes.status})`);
        }
        setEnhancing(false);
      }

      router.push(`/dashboard/meetings/${data.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save meeting";
      setTranscribeError(message);
      alert(message);
    } finally {
      setSaving(false);
      setEnhancing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {permissionDenied && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          Microphone access denied. Allow microphone access in browser settings.
        </div>
      )}

      {transcribeError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
          Transcription error: {transcribeError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Meeting Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={generateMeetingTitle()}
          className="w-full bg-white border border-granola-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400"
        />
      </div>

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
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            autoEnhance ? "bg-granola-700" : "bg-granola-300"
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
              autoEnhance ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-granola-200 p-8 text-center">
        <div className="mb-6">
          <div
            className={cn(
              "text-4xl font-mono font-bold tracking-tight",
              isRecording ? "text-red-500" : "text-ink-400"
            )}
          >
            {formatTime(duration)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full recording-pulse" />
              <span className="text-sm text-red-500 font-medium">Recording</span>
              {isTranscribing && (
                <span className="text-sm text-ink-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating transcript…
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
            >
              <Mic className="w-7 h-7" />
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className="w-14 h-14 bg-granola-700 hover:bg-granola-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                >
                  <Play className="w-6 h-6 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className="w-14 h-14 bg-ink-700 hover:bg-ink-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                >
                  <Pause className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={stopRecording}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105"
              >
                <Square className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-ink-400 mt-4">
          {isRecording
            ? "Speak continuously — transcript grows every few seconds, no pauses needed."
            : "Click the mic to start capturing your meeting"}
        </p>
      </div>

      {(isRecording || isTranscribing || transcript) && (
        <div className="bg-white rounded-xl border border-granola-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Live Transcript</h3>
            {isTranscribing && (
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating…
              </span>
            )}
          </div>
          <div className="text-sm text-ink-600 leading-relaxed max-h-64 overflow-auto">
            {transcript ? (
              <p>
                {transcript}
                {isTranscribing && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-granola-400 animate-pulse align-middle" />
                )}
              </p>
            ) : (
              <span className="text-ink-400 italic">
                {isRecording
                  ? "Listening… words will appear as you speak."
                  : "No transcript captured."}
              </span>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-600 mb-1.5">Your Notes</label>
        <textarea
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder="Jot down your thoughts, key points, action items..."
          rows={8}
          className="w-full bg-white border border-granola-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-granola-400 resize-none font-mono leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => saveMeeting(false)}
          disabled={saving || enhancing || isTranscribing || (!transcript && !rawNotes)}
          className="inline-flex items-center gap-2 bg-white border border-granola-300 text-ink-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-granola-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save Only</>
          )}
        </button>
        <button
          onClick={() => saveMeeting(true)}
          disabled={saving || enhancing || isTranscribing || (!transcript && !rawNotes)}
          className="inline-flex items-center gap-2 bg-granola-800 text-granola-50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-granola-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enhancing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enhancing...
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <img src="/note.png" alt="AI" className="w-4 h-4 object-contain brightness-0 invert" />
              Save & Enhance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
