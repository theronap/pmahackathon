"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading";
import { BionicTextRenderer } from "@/components/renderers/bionic-text-renderer";
import { ChatBubbleRenderer } from "@/components/renderers/chat-bubble-renderer";
import { RSVPPlayer } from "@/components/renderers/rsvp-player";
import { QuizRenderer } from "@/components/renderers/quiz-renderer";
import { FileUpload } from "@/components/file-upload";
import { textToBionic } from "@/lib/bionic";
import { parsePartialConversation } from "@/lib/stream-parser";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updatePreferences } from "@/lib/db/profile";
import { saveSession } from "@/lib/db/sessions";
import type {
  OutputFormat,
  ConversationStyle,
  ConversationResult,
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
  {
    value: "quiz",
    label: "Quiz",
    description: "Test your understanding with auto-generated questions",
  },
];

const STYLE_OPTIONS: { value: ConversationStyle; label: string }[] = [
  { value: "tutor", label: "Tutor + Student" },
  { value: "study-group", label: "Study Group" },
];

type InputMode = "paste" | "upload";

export default function ToolPage() {
  const [inputText, setInputText] = useState("");
  const [format, setFormat] = useState<OutputFormat>("conversation");
  const [conversationStyle, setConversationStyle] = useState<ConversationStyle>("tutor");
  const [result, setResult] = useState<ReformatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamedResult, setStreamedResult] = useState<ConversationResult | null>(null);
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [ready, setReady] = useState(false);

  // File upload state
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileStoragePath, setFileStoragePath] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = inputText.trim().length > 0 && !isOverLimit && !loading && !streaming;

  // Load preferences from profile on mount
  useEffect(() => {
    const supabase = createClient();
    getProfile(supabase).then((profile) => {
      if (profile) {
        setFormat(profile.preferred_format);
        setConversationStyle(profile.preferred_style);
        setShowTypingIndicator(profile.show_typing_indicator);
      }
      setReady(true);
    });
  }, []);

  // Save preferences to profile when they change
  const prefsRef = useRef({ format, conversationStyle, showTypingIndicator });
  useEffect(() => {
    if (!ready) return;
    const prev = prefsRef.current;
    if (
      prev.format === format &&
      prev.conversationStyle === conversationStyle &&
      prev.showTypingIndicator === showTypingIndicator
    )
      return;
    prefsRef.current = { format, conversationStyle, showTypingIndicator };
    const supabase = createClient();
    updatePreferences(supabase, {
      preferred_format: format,
      preferred_style: conversationStyle,
      show_typing_indicator: showTypingIndicator,
    });
  }, [format, conversationStyle, showTypingIndicator, ready]);

  // Save session to DB after getting a result
  const saveResultToDb = useCallback(
    async (resultData: ReformatResult) => {
      const supabase = createClient();
      await saveSession(supabase, {
        input_text: inputText,
        input_source: inputMode === "upload" && fileName ? "file_upload" : "paste",
        file_name: fileName,
        file_storage_path: fileStoragePath,
        format,
        conversation_style: format === "conversation" ? conversationStyle : null,
        result: resultData,
      });
    },
    [inputText, inputMode, fileName, fileStoragePath, format, conversationStyle]
  );

  const handleStreamedConversation = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

    const res = await fetch("/api/reformat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, format: "conversation", conversationStyle }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    setStreaming(true);
    setStreamedResult(null);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });

      const partial = parsePartialConversation(accumulated, conversationStyle);
      if (partial) {
        setStreamedResult(partial);
      }
    }

    // Final parse
    let jsonStr = accumulated.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr);
    const finalResult: ConversationResult = {
      format: "conversation",
      style: conversationStyle,
      speakers: parsed.speakers,
      dialogue: parsed.dialogue,
    };

    setResult(finalResult);
    setStreamedResult(null);
    setStreaming(false);

    // Save to DB
    await saveResultToDb(finalResult);
  }, [inputText, conversationStyle, saveResultToDb]);

  async function handleReformat() {
    setError(null);
    setResult(null);
    setStreamedResult(null);

    if (format === "bionic") {
      const paragraphs = textToBionic(inputText);
      const bionicResult: BionicResult = { format: "bionic", paragraphs };
      setResult(bionicResult);
      await saveResultToDb(bionicResult);
      return;
    }

    if (format === "rsvp") {
      const words = inputText.split(/\s+/).filter((w) => w.length > 0);
      const rsvpResult: RSVPResult = { format: "rsvp", words };
      setResult(rsvpResult);
      await saveResultToDb(rsvpResult);
      return;
    }

    if (format === "conversation") {
      try {
        await handleStreamedConversation();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStreaming(false);
        setStreamedResult(null);
      }
      return;
    }

    // Quiz: standard fetch (no streaming)
    setLoading(true);
    try {
      const res = await fetch("/api/reformat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, format }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      setResult(data);
      await saveResultToDb(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileUploaded(text: string, name: string, storagePath: string) {
    setInputText(text);
    setFileName(name);
    setFileStoragePath(storagePath);
  }

  // Determine what to display for conversation: streamed partial or final result
  const displayConversation = streaming ? streamedResult : (result?.format === "conversation" ? result : null);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reformat Your Text</h1>
          <p className="text-gray-400">
            Paste your lecture notes, syllabus, or textbook excerpt below, or upload a file.
          </p>
        </div>

        {/* Input mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputMode("paste")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              inputMode === "paste"
                ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300"
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setInputMode("upload")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              inputMode === "upload"
                ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300"
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Input */}
        <Card className="p-6 mb-6">
          {inputMode === "upload" && (
            <div className="mb-4">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          )}

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Clear file metadata if user manually edits after upload
              if (inputMode === "upload") {
                setFileName(null);
                setFileStoragePath(null);
              }
            }}
            placeholder={
              inputMode === "upload"
                ? "File text will appear here, or you can edit it..."
                : "Paste your academic text here..."
            }
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
            {fileName && (
              <span className="text-sm text-teal-400">
                Uploaded: {fileName}
              </span>
            )}
          </div>
        </Card>

        {/* Format Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
            Output Format
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFormat(opt.value);
                  setResult(null);
                  setStreamedResult(null);
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

        {/* Settings row */}
        {format === "conversation" && (
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTypingIndicator}
                onChange={(e) => setShowTypingIndicator(e.target.checked)}
                className="accent-teal-400 h-4 w-4 rounded cursor-pointer"
              />
              Show typing indicator
            </label>
          </div>
        )}

        {/* Submit */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={handleReformat}
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            {loading || streaming ? (
              <span className="flex items-center gap-3">
                <LoadingDots />
                {streaming ? "Streaming..." : "Generating quiz..."}
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

        {/* Streaming conversation output */}
        {streaming && displayConversation && (
          <Card className="p-6 mb-6" glow>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Result
            </h2>
            <ChatBubbleRenderer
              speakers={displayConversation.speakers}
              dialogue={displayConversation.dialogue}
              isStreaming={true}
              showTypingIndicator={showTypingIndicator}
            />
          </Card>
        )}

        {/* Final output */}
        {!streaming && result && (
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
            {result.format === "quiz" && <QuizRenderer questions={result.questions} />}
          </Card>
        )}
      </div>
    </div>
  );
}
