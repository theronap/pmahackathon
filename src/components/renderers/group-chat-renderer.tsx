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
  { label: "Slow", value: 4000 },
  { label: "Normal", value: 2000 },
  { label: "Fast", value: 800 },
];

interface GroupChatRendererProps {
  messages: GroupChatMessage[];
  chunkText: string;
  onMessagesUpdate: (messages: GroupChatMessage[]) => void;
}

export function GroupChatRenderer({ messages, chunkText, onMessagesUpdate }: GroupChatRendererProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [revealDone, setRevealDone] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Count only the initial AI messages (not user-added ones)
  const initialMessageCount = useRef(messages.length);
  useEffect(() => {
    // Reset on fresh set of messages (new chunk)
    if (messages.length > 0 && messages.every((m) => !m.isUser)) {
      initialMessageCount.current = messages.length;
      setVisibleCount(0);
      setRevealDone(false);
      setIsPaused(false);
    }
  }, [messages.length, messages]);

  // Progressive reveal timer
  const revealNext = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1;
      if (next >= initialMessageCount.current) {
        setRevealDone(true);
        return initialMessageCount.current;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isPaused || revealDone) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (visibleCount < initialMessageCount.current) {
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
  }, [visibleCount, messages.length]);

  // Show initial messages (up to visibleCount) plus any user-added messages
  const visibleMessages = [
    ...messages.slice(0, visibleCount),
    ...messages.slice(initialMessageCount.current),
  ];

  const canInteract = isPaused || revealDone;

  function handlePause() {
    setIsPaused(true);
  }

  function handleResume() {
    if (revealDone) return;
    setIsPaused(false);
  }

  function handleShowAll() {
    setVisibleCount(initialMessageCount.current);
    setRevealDone(true);
    setIsPaused(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: GroupChatMessage = {
      id: `user-${Date.now()}`,
      sender: "You",
      text: text.trim(),
      isUser: true,
      color: "#94a3b8",
    };

    const updated = [...messages, userMsg];
    onMessagesUpdate(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunk: chunkText,
          thread: visibleMessages.concat(userMsg).slice(-10).map((m) => ({ sender: m.sender, text: m.text })),
          userMessage: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to get reply");

      const data = await res.json();
      const COLORS: Record<string, string> = {
        Casey: "#2dd4bf",
        Riley: "#a78bfa",
        Morgan: "#fb923c",
      };

      const replyMsg: GroupChatMessage = {
        id: `reply-${Date.now()}`,
        sender: data.sender,
        text: data.text,
        isUser: false,
        color: COLORS[data.sender] || "#2dd4bf",
      };

      onMessagesUpdate([...updated, replyMsg]);
    } catch {
      // silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {!revealDone && !isPaused && (
            <button
              onClick={handlePause}
              className="px-4 py-1.5 text-xs rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/40 hover:bg-teal-500/30 transition-all cursor-pointer font-medium flex items-center gap-1.5"
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
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Resume
            </button>
          )}
          {!revealDone && (
            <button
              onClick={handleShowAll}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300 transition-all cursor-pointer"
            >
              Show all
            </button>
          )}
        </div>

        {/* Speed control */}
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
                  ? "bg-gray-700 text-gray-100 rounded-br-md"
                  : "bg-gray-800/80 text-gray-100 rounded-bl-md"
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
        {((!revealDone && !isPaused && visibleCount < initialMessageCount.current) || loading) && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-2xl rounded-bl-md px-4 py-3">
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
                className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300 hover:border-gray-600 transition-all cursor-pointer disabled:opacity-50"
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
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* Hint when messages are still revealing */}
      {!canInteract && (
        <p className="text-xs text-gray-500 text-center pt-1">
          Pause to jump in and ask questions
        </p>
      )}
    </div>
  );
}
