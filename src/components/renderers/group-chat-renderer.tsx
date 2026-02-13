"use client";

import { useState } from "react";
import { LoadingDots } from "@/components/ui/loading";
import type { GroupChatMessage } from "@/types";

const QUICK_REPLIES = [
  "Got it",
  "Can you explain that?",
  "What's the main point?",
];

interface GroupChatRendererProps {
  messages: GroupChatMessage[];
  chunkText: string;
  onMessagesUpdate: (messages: GroupChatMessage[]) => void;
}

export function GroupChatRenderer({ messages, chunkText, onMessagesUpdate }: GroupChatRendererProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
          thread: updated.slice(-10).map((m) => ({ sender: m.sender, text: m.text })),
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
      {/* Message thread */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
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

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-2xl rounded-bl-md px-4 py-3">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

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
          placeholder="Type a message..."
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
    </div>
  );
}
