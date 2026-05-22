"use client";

interface Props {
  html: string;
  className?: string;
}

export function RichTextDisplay({ html, className }: Props) {
  if (!html?.trim()) {
    return <p className="text-ink-400 italic text-sm">No summary yet.</p>;
  }

  return (
    <div
      className={className ?? "rich-summary"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
