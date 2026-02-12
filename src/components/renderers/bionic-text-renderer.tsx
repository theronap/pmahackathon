"use client";

import type { BionicWord } from "@/types";

interface BionicTextRendererProps {
  paragraphs: BionicWord[][];
}

export function BionicTextRenderer({ paragraphs }: BionicTextRendererProps) {
  return (
    <div className="space-y-4">
      {paragraphs.map((words, pIdx) => (
        <p key={pIdx} className="text-gray-200 leading-relaxed text-lg">
          {words.map((word, wIdx) => (
            <span key={wIdx}>
              <strong className="font-bold text-white">{word.bold}</strong>
              <span className="text-gray-400">{word.regular}</span>
              {wIdx < words.length - 1 && " "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
