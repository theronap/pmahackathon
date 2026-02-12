"use client";

import type { Speaker, DialogueLine } from "@/types";

interface ChatBubbleRendererProps {
  speakers: Speaker[];
  dialogue: DialogueLine[];
}

export function ChatBubbleRenderer({
  speakers,
  dialogue,
}: ChatBubbleRendererProps) {
  const speakerMap = new Map(speakers.map((s) => [s.name, s]));
  const speakerNames = speakers.map((s) => s.name);

  return (
    <div className="space-y-3">
      {dialogue.map((line, idx) => {
        const speaker = speakerMap.get(line.speaker);
        const color = speaker?.color || "#94a3b8";
        const isFirst = speakerNames.indexOf(line.speaker) === 0;

        return (
          <div
            key={idx}
            className={`flex flex-col ${isFirst ? "items-start" : "items-end"}`}
          >
            <span
              className="text-xs font-semibold mb-1 px-1"
              style={{ color }}
            >
              {line.speaker}
            </span>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                isFirst
                  ? "rounded-tl-md bg-gray-800 text-gray-100"
                  : "rounded-tr-md text-white"
              }`}
              style={
                !isFirst
                  ? { backgroundColor: color + "20", border: `1px solid ${color}30` }
                  : undefined
              }
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
