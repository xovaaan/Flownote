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
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest">How it works</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-950 leading-[1.1]">
            From rough notes to a polished summary.
          </h2>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto font-medium">
            Record and jot shorthand during the call. Flownote structures everything into clean sections — then generate a share link so anyone can read the enhanced summary.
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
              Intro call: AllFound
            </h3>
            <div className="space-y-1 text-[15px] text-ink-600 font-normal leading-relaxed">
              <p>From Antler,A16Z</p>
              <p>Groq valuation, Raising $50M</p>
              <p>180M post</p>
              <p className="text-ink-500">&quot;Raising in June&quot;|</p>
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
              Intro call: AllFound
            </h3>
            <div className="space-y-5 text-[15px] leading-relaxed flex-1">
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Overview</p>
                <p className="text-ink-700">Raising $50M in June</p>
                <p className="text-ink-400 text-sm mt-0.5">Investors are more likely A16Z & Antler</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Groq Valuation</p>
                
                <p className="text-ink-700 mt-1">~$180M post-money range discussed</p>
                <p className="text-ink-700 mt-1">The valuation is close to 4x from what they are raising</p>
              </div>
              <div>
                <p className="font-semibold text-ink-900 mb-1.5">Deal Timeline</p>
                <p className="text-ink-700">The raising fund amount will be closed in June</p>
                <p className="text-ink-400 text-sm mt-0.5">They are raising $50M at a post money valuation of $180M</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-mono text-ink-400 truncate">
                flownote.app/share/a8Kx…
              </p>
            </div>
          </NoteCard>
        </div>
      </div>
    </section>
  );
}
