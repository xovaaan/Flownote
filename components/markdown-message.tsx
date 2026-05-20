"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: Props) {
  return (
    <div className={cn("text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphs
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },

        // Headings — use sparingly per prompt instructions but support them
        h1({ children }) {
          return <h1 className="text-base font-bold text-ink-900 mt-3 mb-1 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-sm font-bold text-ink-800 mt-3 mb-1 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-semibold text-ink-700 mt-2 mb-1 first:mt-0">{children}</h3>;
        },

        // Inline formatting
        strong({ children }) {
          return <strong className="font-semibold text-inherit">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic text-inherit">{children}</em>;
        },

        // Lists
        ul({ children }) {
          return <ul className="mt-1 mb-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return (
            <ol className="mt-1 mb-2 space-y-1 [counter-reset:list-counter]">
              {children}
            </ol>
          );
        },
        li({ children, node }) {
          // Detect if parent is ol or ul via node
          const isOrdered = (node as any)?.parent?.tagName === "ol";
          return (
            <li className="flex gap-2 items-start">
              <span className="flex-shrink-0 mt-0.5 text-granola-600 font-medium select-none min-w-[1rem] text-center">
                {isOrdered ? "·" : "•"}
              </span>
              <span className="flex-1">{children}</span>
            </li>
          );
        },

        // Code — v10 uses data-language attribute, no inline prop
        code({ children, className: codeClass }) {
          const isBlock = codeClass?.startsWith("language-");
          if (isBlock) {
            return (
              <pre className="bg-ink-900 text-granola-100 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="bg-granola-100 text-granola-800 px-1.5 py-0.5 rounded-md text-xs font-medium">
              {children}
            </code>
          );
        },

        // Blockquote
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-granola-400 pl-3 italic text-ink-500 my-2">
              {children}
            </blockquote>
          );
        },

        // Horizontal rule
        hr() {
          return <hr className="border-granola-200 my-3" />;
        },

        // Links
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-granola-700 underline underline-offset-2 hover:text-granola-900"
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
