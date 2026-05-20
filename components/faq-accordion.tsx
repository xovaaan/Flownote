"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqAccordion() {
  const faqs = [
    {
      question: "Does a bot join my call?",
      answer: "No. Flownote records the audio directly from your computer's microphone and speakers. There is no awkward bot joining your meeting.",
    },
    {
      question: "Where is my data stored?",
      answer: "Your transcripts and notes are stored securely in our database. We do not store the audio files after transcription is complete.",
    },
    {
      question: "Does it work with Zoom, Meet, and Teams?",
      answer: "Yes! Because it records system audio, it works with literally any video conferencing software, or even a phone call on speaker.",
    },
    {
      question: "Can I use it on my phone?",
      answer: "Currently, Flownote is optimized for desktop browsers (Chrome/Edge) to capture system audio properly.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-granola-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h3 className="font-bold text-ink-900 text-lg">{faq.question}</h3>
            <ChevronDown
              className={cn("w-5 h-5 text-ink-400 transition-transform duration-300", openIndex === idx ? "rotate-180" : "rotate-0")}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              openIndex === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="p-6 pt-0 text-ink-500 leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
