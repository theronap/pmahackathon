import type { TextChunk } from "@/types";

const TARGET_WORDS = 400;

export function chunkText(text: string): TextChunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const chunks: TextChunk[] = [];
  let currentParagraphs: string[] = [];
  let currentWords = 0;

  for (const para of paragraphs) {
    const wc = para.split(/\s+/).filter((w) => w.length > 0).length;

    if (currentWords + wc > TARGET_WORDS && currentParagraphs.length > 0) {
      const text = currentParagraphs.join("\n\n");
      chunks.push({
        index: chunks.length,
        text,
        wordCount: currentWords,
      });
      currentParagraphs = [para];
      currentWords = wc;
    } else {
      currentParagraphs.push(para);
      currentWords += wc;
    }
  }

  // Remaining paragraphs
  if (currentParagraphs.length > 0) {
    // Merge small remainder into last chunk
    if (chunks.length > 0 && currentWords < TARGET_WORDS / 3) {
      const last = chunks[chunks.length - 1];
      last.text += "\n\n" + currentParagraphs.join("\n\n");
      last.wordCount += currentWords;
    } else {
      chunks.push({
        index: chunks.length,
        text: currentParagraphs.join("\n\n"),
        wordCount: currentWords,
      });
    }
  }

  // If no paragraphs were found (single block of text), return the whole thing
  if (chunks.length === 0 && text.trim().length > 0) {
    const wc = text.split(/\s+/).filter((w) => w.length > 0).length;
    chunks.push({ index: 0, text: text.trim(), wordCount: wc });
  }

  return chunks;
}

export function estimateReadingTime(chunks: TextChunk[]): number {
  const totalWords = chunks.reduce((sum, c) => sum + c.wordCount, 0);
  return Math.ceil(totalWords / 180);
}
