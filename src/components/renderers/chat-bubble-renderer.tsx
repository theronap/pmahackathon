"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Speaker, DialogueLine } from "@/types";

const SPEED_OPTIONS = [
  { label: "Slow", value: 3500 },
  { label: "Normal", value: 1800 },
  { label: "Fast", value: 700 },
];

interface ChatBubbleRendererProps {
  speakers: Speaker[];
  dialogue: DialogueLine[];
  isStreaming?: boolean;
  showTypingIndicator?: boolean;
  progressiveReveal?: boolean;
}

export function ChatBubbleRenderer({
  speakers,
  dialogue,
  isStreaming = false,
  showTypingIndicator = true,
  progressiveReveal = false,
}: ChatBubbleRendererProps) {
  const speakerMap = new Map(speakers.map((s) => [s.name, s]));
  const speakerNames = speakers.map((s) => s.name);

  // Progressive reveal state
  const [visibleCount, setVisibleCount] = useState(progressiveReveal ? 0 : dialogue.length);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1800);
  const [revealDone, setRevealDone] = useState(!progressiveReveal);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalLines = dialogue.length;

  // Reset on new dialogue
  useEffect(() => {
    if (progressiveReveal) {
      setVisibleCount(0);
      setRevealDone(false);
      setIsPaused(false);
    } else {
      setVisibleCount(dialogue.length);
      setRevealDone(true);
    }
  }, [dialogue, progressiveReveal]);

  const revealNext = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1;
      if (next >= totalLines) {
        setRevealDone(true);
        return totalLines;
      }
      return next;
    });
  }, [totalLines]);

  useEffect(() => {
    if (!progressiveReveal || isPaused || revealDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (visibleCount < totalLines) {
      timerRef.current = setTimeout(revealNext, speed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visibleCount, isPaused, revealDone, speed, revealNext, progressiveReveal, totalLines]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const linesToShow = progressiveReveal ? dialogue.slice(0, visibleCount) : dialogue;
  const isRevealing = progressiveReveal && !revealDone && !isPaused && visibleCount < totalLines;

  return (
    <div className="space-y-3">
      {/* Controls — only for progressive reveal */}
      {progressiveReveal && (
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {!revealDone && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isPaused ? (
                  <>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    Pause
                  </>
                )}
              </button>
            )}
            {!revealDone && (
              <button
                onClick={() => { setVisibleCount(totalLines); setRevealDone(true); }}
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300 transition-all cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Speed:</span>
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                  speed === opt.value
                    ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                    : "bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className={progressiveReveal ? "space-y-3 max-h-[55vh] overflow-y-auto pr-2" : "space-y-3"}>
        {linesToShow.map((line, idx) => {
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

        {/* Typing indicator — streaming or progressive reveal */}
        {((isStreaming && showTypingIndicator) || isRevealing) && (
          <div className="flex flex-col items-start">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-md bg-gray-800">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gray-500 animate-[bounce_1s_ease-in-out_infinite]" />
                <span className="h-2 w-2 rounded-full bg-gray-500 animate-[bounce_1s_ease-in-out_0.15s_infinite]" />
                <span className="h-2 w-2 rounded-full bg-gray-500 animate-[bounce_1s_ease-in-out_0.3s_infinite]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
