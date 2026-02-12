import type { BionicWord } from "@/types";

function getBoldLength(wordLength: number): number {
  if (wordLength <= 1) return 1;
  if (wordLength <= 3) return 1;
  if (wordLength <= 6) return 2;
  if (wordLength <= 9) return 3;
  return Math.ceil(wordLength * 0.4);
}

export function toBionicWord(word: string): BionicWord {
  if (word.length === 0) return { bold: "", regular: "" };
  const boldLen = getBoldLength(word.length);
  return {
    bold: word.slice(0, boldLen),
    regular: word.slice(boldLen),
  };
}

export function textToBionic(text: string): BionicWord[][] {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((paragraph) => {
      const words = paragraph.split(/\s+/).filter((w) => w.length > 0);
      return words.map(toBionicWord);
    });
}
