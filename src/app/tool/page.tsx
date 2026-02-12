"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading";
import { BionicTextRenderer } from "@/components/renderers/bionic-text-renderer";
import { ChatBubbleRenderer } from "@/components/renderers/chat-bubble-renderer";
import { RSVPPlayer } from "@/components/renderers/rsvp-player";
import { textToBionic } from "@/lib/bionic";
import type {
  OutputFormat,
  ConversationStyle,
  ReformatResult,
  BionicResult,
  RSVPResult,
} from "@/types";

const MAX_CHARS = 15000;

const FORMAT_OPTIONS: { value: OutputFormat; label: string; description: string }[] = [
  {
    value: "conversation",
    label: "Conversation",
    description: "Turn dense text into a natural dialogue",
  },
  {
    value: "bionic",
    label: "Bionic Reading",
    description: "Bold key letters to guide your eyes faster",
  },
  {
    value: "rsvp",
    label: "RSVP Reader",
    description: "Focus on one word at a time at your pace",
  },
];

const STYLE_OPTIONS: { value: ConversationStyle; label: string }[] = [
  { value: "tutor", label: "Tutor + Student" },
  { value: "study-group", label: "Study Group" },
];

export default function ToolPage() {
  const [inputText, setInputText] = useState("");
  const [format, setFormat] = useState<OutputFormat>("conversation");
  const [conversationStyle, setConversationStyle] = useState<ConversationStyle>("tutor");
  const [result, setResult] = useState<ReformatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = inputText.trim().length > 0 && !isOverLimit && !loading;

  async function handleReformat() {
    setError(null);
    setResult(null);

    if (format === "bionic") {
      const paragraphs = textToBionic(inputText);
      setResult({ format: "bionic", paragraphs } as BionicResult);
      return;
    }

    if (format === "rsvp") {
      const words = inputText.split(/\s+/).filter((w) => w.length > 0);
      setResult({ format: "rsvp", words } as RSVPResult);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reformat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, format, conversationStyle }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reformat Your Text</h1>
          <p className="text-gray-400">
            Paste your lecture notes, syllabus, or textbook excerpt below.
          </p>
        </div>

        {/* Input */}
        <Card className="p-6 mb-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your academic text here..."
            rows={8}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 resize-y text-base leading-relaxed"
          />
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm ${
                isOverLimit ? "text-red-400" : "text-gray-500"
              }`}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </div>
        </Card>

        {/* Format Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Output Format
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFormat(opt.value);
                  setResult(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  format === opt.value
                    ? "border-teal-400/60 bg-teal-400/10 ring-1 ring-teal-400/30"
                    : "border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/60"
                }`}
              >
                <div className="font-medium text-white text-sm">{opt.label}</div>
                <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
              </button>
            ))}
          </div>

          {/* Conversation style sub-option */}
          {format === "conversation" && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Conversation Style
              </h3>
              <div className="flex gap-3">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setConversationStyle(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      conversationStyle === opt.value
                        ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                        : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={handleReformat}
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <LoadingDots />
                Reformatting...
              </span>
            ) : (
              "Reformat Text"
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="p-4 mb-6 border-red-500/30 bg-red-500/5">
            <p className="text-red-400 text-sm">{error}</p>
          </Card>
        )}

        {/* Output */}
        {result && (
          <Card className="p-6" glow>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Result
            </h2>
            {result.format === "bionic" && (
              <BionicTextRenderer paragraphs={result.paragraphs} />
            )}
            {result.format === "conversation" && (
              <ChatBubbleRenderer
                speakers={result.speakers}
                dialogue={result.dialogue}
              />
            )}
            {result.format === "rsvp" && <RSVPPlayer words={result.words} />}
          </Card>
        )}
      </div>
    </div>
  );
}
