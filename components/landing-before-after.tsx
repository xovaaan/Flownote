import type { ReactNode } from "react";
import { ChevronRight, Minus, Square, X, Sparkles } from "lucide-react";

function WindowChrome() {
  return (
    <div className="flex items-center gap-2 text-ink-300">
      <Minus className="w-3.5 h-3.5" strokeWidth={2} />
      <Square className="w-3 h-3" strokeWidth={2} />
      <X className="w-3.5 h-3.5" strokeWidth={2} />
    </div>
  );
}

function RecordingPill() {
  return (
    <div className="inline-flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
      <div className="flex items-end gap-0.5 h-4">
        <span className="w-0.5 h-2 bg-emerald-500 rounded-full" />
        <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full" />
        <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full" />
        <span className="w-0.5 h-4 bg-emerald-500 rounded-full" />
        <span className="w-0.5 h-2 bg-emerald-500 rounded-full" />
      </div>
      <span className="w-3.5 h-3.5 rounded-sm bg-ink-400" />
    </div>
  );
}

function NoteCard({
  label,
  labelIcon,
  children,
  footer,
}: {
  label: string;
  labelIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 flex-1 min-w-0">
      <p className="text-sm font-medium text-ink-500 flex items-center gap-1.5">
        {labelIcon}
        {label}
      </p>
      <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col min-h-[340px] md:min-h-[380px]">
        <div className="flex items-center justify-end px-4 py-3 border-b border-gray-100">
          <WindowChrome />
        </div>
        <div className="flex-1 px-6 md:px-8 py-6 md:py-8 flex flex-col">{children}</div>
        {footer && (
          <div className="px-6 pb-6 flex justify-center">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function LandingBeforeAfter() {
  return (
    <section
      className="relative py-24 md:py-32 px-4 md:px-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/two.jpg)" }}
    >
      <div className="absolute inset-0 bg-white/88 backdrop-blur-[2px]" aria-hidden />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14 md:mb-16 space-y-4">
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">Before &amp; after</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">
            Messy call notes become a summary you can share.
          </h2>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-medium">
            Capture audio and scribble shorthand while you talk. Flownote merges your notes with the transcript into structured sections — then one link for your team or investors.
          </p>
        </div>

        <div className="relative flex flex-col lg:flex-row items-stretch gap-6 lg:gap-4">
          {/* Decorative avatars — video call context */}
          <div className="hidden xl:flex flex-col gap-3 absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-granola-200 to-granola-400 border-2 border-white shadow-md" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-200 to-ink-400 border-2 border-white shadow-md -ml-2" />
          </div>

          <NoteCard label="Your notes + transcript" footer={<RecordingPill />}>
            <h3 className="font-serif text-2xl md:text-[1.65rem] text-ink-950 leading-snug mb-6">
              Fundraise sync — Groq
            </h3>
            <div className="space-y-1 text-[15px] text-ink-600 font-normal leading-relaxed">
              <p>warm intros — antler, a16z</p>
              <p>raising 50, target june</p>
              <p>groq val ~180 post</p>
              <p>~4x last round, deck v3</p>
              <p className="text-ink-500">send ic memo by fri|</p>
            </div>
          </NoteCard>

          <div className="hidden lg:flex items-center justify-center px-2 shrink-0 self-center">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-ink-400">
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          <div className="lg:hidden flex justify-center py-1 text-ink-300">
            <ChevronRight className="w-6 h-6 rotate-90" strokeWidth={2} />
          </div>

          <NoteCard
            label="AI enhanced"
            labelIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          >
            <h3 className="font-serif text-2xl md:text-[1.65rem] text-ink-950 leading-snug mb-6">
              Fundraise sync — Groq
            </h3>
            <div className="space-y-5 text-[15px] leading-relaxed flex-1">
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Round overview</p>
                <p className="text-ink-700">Raising $50M with a target close in June</p>
                <p className="text-ink-400 text-sm mt-0.5">Warm paths through Antler and a16z</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Groq valuation</p>
                <p className="text-ink-700">~$180M post-money discussed on the call</p>
                <p className="text-ink-400 text-sm">Roughly 4× uplift from the prior round</p>
                <p className="text-ink-700 mt-1">Deck v3 is the version going to investors</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Action items</p>
                <p className="text-ink-700">Send IC memo by Friday</p>
                <p className="text-ink-400 text-sm mt-0.5">Align term sheet narrative before June outreach</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-mono text-ink-400 truncate">
                flownoteai.vercel.app/share/k9Qm…
              </p>
            </div>
          </NoteCard>
        </div>
      </div>
    </section>
  );
}
