import type { ConversationStyle, Speaker, DialogueLine, ConversationResult } from "@/types";

/**
 * Find the index of the closing bracket that matches the opening bracket at `start`.
 * Handles nested brackets and strings with escaped characters.
 */
function findMatchingBracket(text: string, start: number, open: string, close: string): number {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\') i++;
        i++;
      }
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Attempt to parse speakers and dialogue entries from a partially-streamed JSON string.
 * Returns null if not enough data has been streamed yet.
 */
export function parsePartialConversation(
  text: string,
  style: ConversationStyle
): ConversationResult | null {
  let json = text.trim();
  if (json.startsWith("```")) {
    json = json.replace(/^```(?:json)?\s*/, "");
  }

  // Extract speakers array
  const speakersIdx = json.indexOf('"speakers"');
  if (speakersIdx === -1) return null;

  const speakersArrayStart = json.indexOf('[', speakersIdx);
  if (speakersArrayStart === -1) return null;

  const speakersEnd = findMatchingBracket(json, speakersArrayStart, '[', ']');
  if (speakersEnd === -1) return null;

  let speakers: Speaker[];
  try {
    speakers = JSON.parse(json.slice(speakersArrayStart, speakersEnd + 1));
  } catch {
    return null;
  }

  // Extract dialogue entries
  const dialogueIdx = json.indexOf('"dialogue"');
  if (dialogueIdx === -1) return null;

  const dialogueArrayStart = json.indexOf('[', dialogueIdx);
  if (dialogueArrayStart === -1) return null;

  const dialogueContent = json.slice(dialogueArrayStart + 1);
  const dialogue: DialogueLine[] = [];

  let depth = 0;
  let objStart = -1;

  for (let i = 0; i < dialogueContent.length; i++) {
    const ch = dialogueContent[i];
    if (ch === '"') {
      i++;
      while (i < dialogueContent.length && dialogueContent[i] !== '"') {
        if (dialogueContent[i] === '\\') i++;
        i++;
      }
    } else if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try {
          const obj = JSON.parse(dialogueContent.slice(objStart, i + 1));
          if (obj.speaker && obj.text) {
            dialogue.push({ speaker: obj.speaker, text: obj.text });
          }
        } catch {
          // incomplete object, skip
        }
        objStart = -1;
      }
    }
  }

  if (dialogue.length === 0) return null;

  return { format: "conversation", style, speakers, dialogue };
}
