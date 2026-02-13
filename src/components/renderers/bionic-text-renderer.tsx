"use client";

import type { BionicWord } from "@/types";

interface BionicTextRendererProps {
  paragraphs: BionicWord[][];
}

export function BionicTextRenderer({ paragraphs }: BionicTextRendererProps) {
  return (
    <div className="space-y-4">
      {paragraphs.map((words, pIdx) => (
        <p key={pIdx} className="text-[var(--color-text)] leading-relaxed text-lg">
          {words.map((word, wIdx) => (
            <span key={wIdx}>
              <strong className="font-bold text-[var(--color-heading)]">{word.bold}</strong>
              <span className="text-[var(--color-body)]">{word.regular}</span>
              {wIdx < words.length - 1 && " "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
