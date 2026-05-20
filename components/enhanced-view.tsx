"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props { content: string; }

export function EnhancedView({ content }: Props) {
  return (
    <div className="bg-white rounded-xl border border-granola-200 p-6">
      <div className="editor-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
