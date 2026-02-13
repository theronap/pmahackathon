"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LoadingDots } from "@/components/ui/loading";
import type { Speaker, DialogueLine, ConversationStyle } from "@/types";

const QUICK_REPLIES = [
  "Can you explain that?",
  "Give me an example",
  "Why is that important?",
  "Simplify that for me",
];

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
  chunkText?: string;
  conversationStyle?: ConversationStyle;
}

export function ChatBubbleRenderer({
  speakers,
  dialogue,
  isStreaming = false,
  showTypingIndicator = true,
  progressiveReveal = false,
  chunkText,
  conversationStyle,
}: ChatBubbleRendererProps) {
  const speakerMap = new Map(speakers.map((s) => [s.name, s]));
  const speakerNames = speakers.map((s) => s.name);

  // Combined dialogue: original lines + user-inserted exchanges
  const [combinedDialogue, setCombinedDialogue] = useState<DialogueLine[]>(dialogue);
  const [visibleCount, setVisibleCount] = useState(progressiveReveal ? 0 : dialogue.length);
  const visibleCountRef = useRef(visibleCount);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1800);
  const [revealDone, setRevealDone] = useState(!progressiveReveal);

  // Interaction state
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track the total number of lines (original + inserted)
  const totalLinesRef = useRef(dialogue.length);

  // Keep visibleCountRef in sync
  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  // Reset on new dialogue
  useEffect(() => {
    setCombinedDialogue(dialogue);
    totalLinesRef.current = dialogue.length;
    if (progressiveReveal) {
      setVisibleCount(0);
      visibleCountRef.current = 0;
      setRevealDone(false);
      setIsPaused(false);
    } else {
      setVisibleCount(dialogue.length);
      visibleCountRef.current = dialogue.length;
      setRevealDone(true);
    }
  }, [dialogue, progressiveReveal]);

  const revealNext = useCallback(() => {
    setVisibleCount((prev) => {
      const total = totalLinesRef.current;
      const next = prev + 1;
      if (next >= total) {
        setRevealDone(true);
        return total;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!progressiveReveal || isPaused || revealDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (visibleCount < totalLinesRef.current) {
      timerRef.current = setTimeout(revealNext, speed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visibleCount, isPaused, revealDone, speed, revealNext, progressiveReveal]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const linesToShow = progressiveReveal ? combinedDialogue.slice(0, visibleCount) : combinedDialogue;
  const isRevealing = progressiveReveal && !revealDone && !isPaused && visibleCount < totalLinesRef.current;
  const canInteract = progressiveReveal && (isPaused || revealDone);

  function handleJumpIn() {
    setIsPaused(true);
  }

  function handleResume() {
    if (revealDone) return;
    setIsPaused(false);
  }

  function handleShowAll() {
    const total = totalLinesRef.current;
    setVisibleCount(total);
    visibleCountRef.current = total;
    setRevealDone(true);
    setIsPaused(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const currentPos = visibleCountRef.current;

    // Splice user message into combinedDialogue at current position
    const userLine: DialogueLine = { speaker: "You", text: text.trim() };

    setCombinedDialogue((prev) => {
      const updated = [...prev];
      updated.splice(currentPos, 0, userLine);
      return updated;
    });
    totalLinesRef.current += 1;
    setVisibleCount(currentPos + 1);
    visibleCountRef.current = currentPos + 1;
    setInput("");
    setLoading(true);

    try {
      // Build thread context from visible lines
      const threadLines = combinedDialogue
        .slice(0, currentPos)
        .concat(userLine)
        .slice(-10)
        .map((l) => ({ speaker: l.speaker, text: l.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunk: chunkText || "",
          thread: threadLines,
          userMessage: text.trim(),
          mode: "story",
          conversationStyle: conversationStyle || "tutor",
        }),
      });

      if (!res.ok) throw new Error("Failed to get reply");

      const data = await res.json();
      const replyLine: DialogueLine = { speaker: data.sender, text: data.text };

      const insertPos = visibleCountRef.current;
      setCombinedDialogue((prev) => {
        const updated = [...prev];
        updated.splice(insertPos, 0, replyLine);
        return updated;
      });
      totalLinesRef.current += 1;
      setVisibleCount(insertPos + 1);
      visibleCountRef.current = insertPos + 1;
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Controls — only for progressive reveal */}
      {progressiveReveal && (
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--color-card-border)]">
          <div className="flex items-center gap-2">
            {!revealDone && !isPaused && (
              <button
                onClick={handleJumpIn}
                className="px-4 py-1.5 text-xs rounded-lg bg-[var(--color-accent-soft)] text-brand-600 border border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer font-medium flex items-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Jump in
              </button>
            )}
            {isPaused && !revealDone && (
              <button
                onClick={handleResume}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-card-border)] hover:bg-[var(--color-surface-alt)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Resume
              </button>
            )}
            {!revealDone && (
              <button
                onClick={handleShowAll}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--color-surface)] text-[var(--color-body)] border border-[var(--color-card-border)] hover:text-[var(--color-text)] transition-all cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--color-muted)]">Speed:</span>
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`px-2 py-1 text-[11px] rounded-md transition-all cursor-pointer ${
                  speed === opt.value
                    ? "bg-[var(--color-accent-soft)] text-brand-600 border border-[var(--color-accent-border)]"
                    : "bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-card-border)] hover:text-[var(--color-body)]"
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
          // User-inserted messages
          if (line.speaker === "You") {
            return (
              <div key={idx} className="flex flex-col items-end animate-[fadeIn_0.3s_ease-out]">
                <span className="text-xs font-semibold mb-1 px-1 text-[var(--color-muted)]">
                  You
                </span>
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-md text-sm leading-relaxed bg-[var(--color-surface-alt)] text-[var(--color-text)]">
                  {line.text}
                </div>
              </div>
            );
          }

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
                    ? "rounded-tl-md bg-[var(--color-surface)] text-[var(--color-text)]"
                    : "rounded-tr-md text-[var(--color-heading)]"
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

        {/* Typing indicator — streaming, progressive reveal, or API call */}
        {((isStreaming && showTypingIndicator) || isRevealing || loading) && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface)] rounded-2xl rounded-bl-md px-4 py-3">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      {/* Interaction area — visible when paused or reveal done (progressive only) */}
      {canInteract && (
        <>
          {/* Quick replies */}
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                disabled={loading}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--color-surface)] text-[var(--color-body)] border border-[var(--color-card-border)] hover:text-[var(--color-text)] hover:border-[var(--color-border)] transition-all cursor-pointer disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask a question or comment..."
              disabled={loading}
              className="flex-1 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400/50 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* Hint when messages are still revealing */}
      {progressiveReveal && !canInteract && !revealDone && (
        <p className="text-xs text-[var(--color-muted)] text-center pt-1">
          Click &quot;Jump in&quot; to pause and ask questions
        </p>
      )}
    </div>
  );
}
