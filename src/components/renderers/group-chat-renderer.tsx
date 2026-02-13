"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LoadingDots } from "@/components/ui/loading";
import type { GroupChatMessage } from "@/types";

const QUICK_REPLIES = [
  "Got it",
  "Can you explain that?",
  "What's the main point?",
  "Give me a real-world example",
];

const SPEED_OPTIONS = [
  { label: "Slow", value: 5000 },
  { label: "Normal", value: 3000 },
  { label: "Fast", value: 1000 },
];

const COLORS: Record<string, string> = {
  Casey: "#2dd4bf",
  Riley: "#a78bfa",
  Morgan: "#fb923c",
};

interface GroupChatRendererProps {
  messages: GroupChatMessage[];
  chunkText: string;
  onMessagesUpdate: (messages: GroupChatMessage[]) => void;
}

export function GroupChatRenderer({ messages, chunkText, onMessagesUpdate }: GroupChatRendererProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Combined messages: original + user-inserted exchanges spliced in place
  const [combinedMessages, setCombinedMessages] = useState<GroupChatMessage[]>(messages);
  const [visibleCount, setVisibleCount] = useState(0);
  const visibleCountRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [revealDone, setRevealDone] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalMessagesRef = useRef(messages.length);

  // Keep visibleCountRef in sync
  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  // Reset on fresh set of messages (new chunk)
  useEffect(() => {
    if (messages.length > 0 && messages.every((m) => !m.isUser)) {
      setCombinedMessages(messages);
      totalMessagesRef.current = messages.length;
      setVisibleCount(0);
      visibleCountRef.current = 0;
      setRevealDone(false);
      setIsPaused(false);
    }
  }, [messages.length, messages]);

  // Progressive reveal timer
  const revealNext = useCallback(() => {
    setVisibleCount((prev) => {
      const total = totalMessagesRef.current;
      const next = prev + 1;
      if (next >= total) {
        setRevealDone(true);
        return total;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isPaused || revealDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (visibleCount < totalMessagesRef.current) {
      timerRef.current = setTimeout(revealNext, speed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visibleCount, isPaused, revealDone, speed, revealNext]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const visibleMessages = combinedMessages.slice(0, visibleCount);
  const isRevealing = !revealDone && !isPaused && visibleCount < totalMessagesRef.current;
  const canInteract = isPaused || revealDone;

  function handlePause() {
    setIsPaused(true);
  }

  function handleResume() {
    if (revealDone) return;
    setIsPaused(false);
  }

  function handleShowAll() {
    const total = totalMessagesRef.current;
    setVisibleCount(total);
    visibleCountRef.current = total;
    setRevealDone(true);
    setIsPaused(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const currentPos = visibleCountRef.current;

    const userMsg: GroupChatMessage = {
      id: `user-${Date.now()}`,
      sender: "You",
      text: text.trim(),
      isUser: true,
      color: "#94a3b8",
    };

    // Splice user message at current reveal position
    setCombinedMessages((prev) => {
      const updated = [...prev];
      updated.splice(currentPos, 0, userMsg);
      return updated;
    });
    totalMessagesRef.current += 1;
    setVisibleCount(currentPos + 1);
    visibleCountRef.current = currentPos + 1;
    setInput("");
    setLoading(true);

    try {
      // Build thread context from visible lines
      const threadLines = combinedMessages
        .slice(0, currentPos)
        .concat(userMsg)
        .slice(-10)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunk: chunkText,
          thread: threadLines,
          userMessage: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to get reply");

      const data = await res.json();

      const replyMsg: GroupChatMessage = {
        id: `reply-${Date.now()}`,
        sender: data.sender,
        text: data.text,
        isUser: false,
        color: COLORS[data.sender] || "#2dd4bf",
      };

      // Splice AI reply right after the user message
      const insertPos = visibleCountRef.current;
      setCombinedMessages((prev) => {
        const updated = [...prev];
        updated.splice(insertPos, 0, replyMsg);
        return updated;
      });
      totalMessagesRef.current += 1;
      setVisibleCount(insertPos + 1);
      visibleCountRef.current = insertPos + 1;

      // Sync parent state with current combined messages
      setCombinedMessages((prev) => {
        onMessagesUpdate(prev);
        return prev;
      });
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--color-card-border)]">
        <div className="flex items-center gap-2">
          {!revealDone && !isPaused && (
            <button
              onClick={handlePause}
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

        {/* Speed control */}
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

      {/* Message thread */}
      <div ref={scrollRef} className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-[fadeIn_0.3s_ease-out]`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.isUser
                  ? "bg-[var(--color-surface-alt)] text-[var(--color-text)] rounded-br-md"
                  : "bg-[var(--color-surface)] text-[var(--color-text)] rounded-bl-md"
              }`}
            >
              {!msg.isUser && (
                <div className="text-xs font-semibold mb-1" style={{ color: msg.color }}>
                  {msg.sender}
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator — during reveal or API call */}
        {(isRevealing || loading) && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface)] rounded-2xl rounded-bl-md px-4 py-3">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      {/* Interaction area — visible when paused or reveal done */}
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
              placeholder="Ask a question or dive deeper..."
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
      {!canInteract && (
        <p className="text-xs text-[var(--color-muted)] text-center pt-1">
          Click &quot;Jump in&quot; to pause and ask questions
        </p>
      )}
    </div>
  );
}
