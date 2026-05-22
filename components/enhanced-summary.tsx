"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { normalizeEnhancedHtml } from "@/lib/enhanced-html";
import { RichTextDisplay } from "@/components/rich-text-display";

interface Props {
  content: string;
}

export function EnhancedSummary({ content }: Props) {
  const html = useMemo(() => normalizeEnhancedHtml(content), [content]);

  return (
    <article className="enhanced-summary-card">
      <div className="enhanced-summary-accent" aria-hidden />
      <header className="enhanced-summary-header">
        <div className="flex items-center gap-2">
          <span className="enhanced-summary-icon">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-medium text-granola-700 tracking-wide">AI summary</span>
        </div>
      </header>
      <div className="enhanced-summary-body">
        <RichTextDisplay html={html} className="rich-summary" />
      </div>
    </article>
  );
}
