"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading";
import { BionicTextRenderer } from "@/components/renderers/bionic-text-renderer";
import { ChatBubbleRenderer } from "@/components/renderers/chat-bubble-renderer";
import { RSVPPlayer } from "@/components/renderers/rsvp-player";
import { QuizRenderer } from "@/components/renderers/quiz-renderer";
import { GroupChatRenderer } from "@/components/renderers/group-chat-renderer";
import { FileUpload } from "@/components/file-upload";
import { VoiceRecorder } from "@/components/voice-recorder";
import { SetupScreen } from "@/components/setup-screen";
import { ProgressBar } from "@/components/progress-bar";
import { CompletionScreen } from "@/components/completion-screen";
import { KeyTakeawaysPanel } from "@/components/key-takeaways-panel";
import { textToBionic } from "@/lib/bionic";
import { chunkText } from "@/lib/chunker";
import { SAMPLE_READING } from "@/lib/sample-text";
import { createClient } from "@/lib/supabase/client";
import { getProfile, updatePreferences } from "@/lib/db/profile";
import { saveSession } from "@/lib/db/sessions";
import type {
  ConversationStyle,
  ConversationResult,
  ReformatResult,
  BionicResult,
  RSVPResult,
  SetupConfig,
  TextChunk,
  GroupChatMessage,
  GroupChatResult,
} from "@/types";

const MAX_CHARS = 15000;

type ViewState = "input" | "setup" | "reading" | "done";
type InputMode = "paste" | "upload" | "record";

function ToolContent() {
  const searchParams = useSearchParams();
  const isSample = searchParams.get("sample") === "1";
  const isDemo = searchParams.get("demo") === "1";

  // View state machine
  const [view, setView] = useState<ViewState>("input");

  // Input state
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileStoragePath, setFileStoragePath] = useState<string | null>(null);

  // Chunking state
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [setupConfig, setSetupConfig] = useState<SetupConfig | null>(null);

  // Per-chunk result state
  const [result, setResult] = useState<ReformatResult | GroupChatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupChatMessages, setGroupChatMessages] = useState<GroupChatMessage[]>([]);

  // Preferences
  const [conversationStyle, setConversationStyle] = useState<ConversationStyle>("tutor");
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [ready, setReady] = useState(false);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canContinue = inputText.trim().length > 0 && !isOverLimit;

  // Load preferences (skip in demo mode)
  useEffect(() => {
    if (isDemo) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    getProfile(supabase).then((profile) => {
      if (profile) {
        setConversationStyle(profile.preferred_style);
        setShowTypingIndicator(profile.show_typing_indicator);
      }
      setReady(true);
    });
  }, [isDemo]);

  // Save preferences (skip in demo mode)
  const prefsRef = useRef({ conversationStyle, showTypingIndicator });
  useEffect(() => {
    if (!ready || isDemo) return;
    const prev = prefsRef.current;
    if (
      prev.conversationStyle === conversationStyle &&
      prev.showTypingIndicator === showTypingIndicator
    )
      return;
    prefsRef.current = { conversationStyle, showTypingIndicator };
    const supabase = createClient();
    updatePreferences(supabase, {
      preferred_style: conversationStyle,
      show_typing_indicator: showTypingIndicator,
    });
  }, [conversationStyle, showTypingIndicator, ready, isDemo]);

  // Handle sample prefill
  useEffect(() => {
    if (isSample && inputText === "") {
      setInputText(SAMPLE_READING);
      const c = chunkText(SAMPLE_READING);
      setChunks(c);
      setView("setup");
    }
  }, [isSample, inputText]);

  // Save session to DB (skip in demo mode)
  const saveResultToDb = useCallback(
    async (resultData: ReformatResult, chunkText: string) => {
      if (isDemo) return;
      const supabase = createClient();
      await saveSession(supabase, {
        input_text: chunkText,
        input_source: inputMode === "upload" && fileName ? "file_upload" : "paste",
        file_name: fileName,
        file_storage_path: fileStoragePath,
        format: resultData.format === "conversation" ? "conversation" :
               resultData.format === "bionic" ? "bionic" :
               resultData.format === "rsvp" ? "rsvp" : "quiz",
        conversation_style: resultData.format === "conversation" ? conversationStyle : null,
        result: resultData,
      });
    },
    [isDemo, inputMode, fileName, fileStoragePath, conversationStyle]
  );

  // Process current chunk based on mode
  const processChunk = useCallback(async (chunk: TextChunk, config: SetupConfig) => {
    setError(null);
    setResult(null);
    setGroupChatMessages([]);

    const mode = config.mode;

    // Focus mode: bionic reading (client-side)
    if (mode === "focus") {
      const paragraphs = textToBionic(chunk.text);
      const bionicResult: BionicResult = { format: "bionic", paragraphs };
      setResult(bionicResult);
      await saveResultToDb(bionicResult, chunk.text);
      return;
    }

    // RSVP mode (client-side)
    if (mode === "rsvp") {
      const words = chunk.text.split(/\s+/).filter((w) => w.length > 0);
      const rsvpResult: RSVPResult = { format: "rsvp", words };
      setResult(rsvpResult);
      await saveResultToDb(rsvpResult, chunk.text);
      return;
    }

    // Plain mode (client-side)
    if (mode === "plain") {
      // Use bionic result structure with no bolding — just set as-is
      // We'll render plain text directly in the view
      setResult({ format: "bionic", paragraphs: [] } as BionicResult);
      return;
    }

    // Story mode: conversation (non-streaming, progressive reveal in renderer)
    if (mode === "story") {
      setLoading(true);
      try {
        const res = await fetch("/api/reformat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunk.text,
            format: "conversation",
            conversationStyle,
            useGenerate: true,
            ...(isDemo && { demo: true }),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong.");
        }

        const data = await res.json();
        const finalResult: ConversationResult = {
          format: "conversation",
          style: conversationStyle,
          speakers: data.speakers,
          dialogue: data.dialogue,
        };

        setResult(finalResult);
        await saveResultToDb(finalResult, chunk.text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Game mode: quiz (non-streaming)
    if (mode === "game") {
      setLoading(true);
      try {
        const res = await fetch("/api/reformat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunk.text,
            format: "quiz",
            ...(isDemo && { demo: true }),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong.");
        }

        const data = await res.json();
        setResult(data);
        await saveResultToDb(data, chunk.text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Group chat mode
    if (mode === "groupchat") {
      setLoading(true);
      try {
        const res = await fetch("/api/reformat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunk.text,
            format: "groupchat",
            ...(isDemo && { demo: true }),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong.");
        }

        const data: GroupChatResult = await res.json();
        setGroupChatMessages(data.messages);
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }
  }, [conversationStyle, isDemo, saveResultToDb]);

  // Auto-process chunk when entering reading view or changing chunk
  useEffect(() => {
    if (view === "reading" && setupConfig && chunks[currentChunkIndex]) {
      processChunk(chunks[currentChunkIndex], setupConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentChunkIndex]);

  function handleContinueToSetup() {
    const c = chunkText(inputText);
    setChunks(c);
    setCurrentChunkIndex(0);
    setView("setup");
  }

  function handleSetupContinue(config: SetupConfig) {
    setSetupConfig(config);
    setCurrentChunkIndex(0);
    setView("reading");
  }

  function handleNextChunk() {
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex((i) => i + 1);
    } else {
      setView("done");
    }
  }

  function handlePrevChunk() {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex((i) => i - 1);
    }
  }

  function handleFinish() {
    setView("input");
    setInputText("");
    setChunks([]);
    setCurrentChunkIndex(0);
    setSetupConfig(null);
    setResult(null);
    setError(null);
    setGroupChatMessages([]);
  }

  function handleFileUploaded(text: string, name: string, storagePath: string) {
    setInputText(text);
    setFileName(name);
    setFileStoragePath(storagePath);
  }

  const currentChunk = chunks[currentChunkIndex];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className={`${view === "reading" ? "max-w-6xl" : "max-w-4xl"} mx-auto px-4 py-8 sm:py-12 transition-all`}>

        {/* ========== INPUT VIEW ========== */}
        {view === "input" && (
          <>
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
              <button
                onClick={() => setInputMode("record")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  inputMode === "record"
                    ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                    : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300"
                }`}
              >
                Record Audio
              </button>
            </div>

            {/* Voice recorder */}
            {inputMode === "record" && (
              <Card className="p-6 mb-4">
                <VoiceRecorder onTranscript={(text) => setInputText((prev) => prev ? prev + "\n\n" + text : text)} />
              </Card>
            )}

            {/* Text input */}
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
                  if (inputMode === "upload") {
                    setFileName(null);
                    setFileStoragePath(null);
                  }
                }}
                placeholder={
                  inputMode === "record"
                    ? "Transcript will appear here, or you can edit it..."
                    : inputMode === "upload"
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

            {/* Continue button */}
            <div className="mb-8">
              <Button
                size="lg"
                onClick={handleContinueToSetup}
                disabled={!canContinue}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* ========== SETUP VIEW ========== */}
        {view === "setup" && (
          <SetupScreen
            chunks={chunks}
            onContinue={handleSetupContinue}
            onBack={() => setView("input")}
          />
        )}

        {/* ========== READING VIEW ========== */}
        {view === "reading" && currentChunk && setupConfig && (
          <>
            <ProgressBar current={currentChunkIndex} total={chunks.length} />

            {/* Error */}
            {error && (
              <Card className="p-4 mb-6 border-red-500/30 bg-red-500/5">
                <p className="text-red-400 text-sm">{error}</p>
              </Card>
            )}

            {/* Loading state */}
            {loading && (
              <Card className="p-8 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <LoadingDots />
                  <span className="text-gray-400 text-sm">Generating...</span>
                </div>
              </Card>
            )}

            {/* Content + side panel grid */}
            {!loading && result && (
              <div className={`${setupConfig.mode !== "game" ? "grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4" : ""} mb-6`}>
                <Card className="p-6" glow>
                  {/* Focus mode: bionic */}
                  {setupConfig.mode === "focus" && result.format === "bionic" && (
                    <BionicTextRenderer paragraphs={result.paragraphs} />
                  )}

                  {/* Story mode: conversation with progressive reveal */}
                  {setupConfig.mode === "story" && result.format === "conversation" && (
                    <ChatBubbleRenderer
                      speakers={result.speakers}
                      dialogue={result.dialogue}
                      progressiveReveal
                    />
                  )}

                  {/* Game mode: quiz */}
                  {setupConfig.mode === "game" && result.format === "quiz" && (
                    <QuizRenderer questions={result.questions} />
                  )}

                  {/* Group chat mode */}
                  {setupConfig.mode === "groupchat" && groupChatMessages.length > 0 && (
                    <GroupChatRenderer
                      messages={groupChatMessages}
                      chunkText={currentChunk.text}
                      onMessagesUpdate={setGroupChatMessages}
                    />
                  )}

                  {/* RSVP mode */}
                  {setupConfig.mode === "rsvp" && result.format === "rsvp" && (
                    <RSVPPlayer words={result.words} />
                  )}

                  {/* Plain mode */}
                  {setupConfig.mode === "plain" && (
                    <div className="prose prose-invert max-w-none">
                      {currentChunk.text.split(/\n\s*\n/).map((para, i) => (
                        <p key={i} className="text-gray-200 leading-relaxed mb-4">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Key Takeaways side panel — all modes except quiz */}
                {setupConfig.mode !== "game" && (
                  <KeyTakeawaysPanel chunkText={currentChunk.text} demo={isDemo} />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handlePrevChunk}
                disabled={currentChunkIndex === 0 || loading}
              >
                Previous Chunk
              </Button>
              <Button
                onClick={handleNextChunk}
                disabled={loading}
              >
                {currentChunkIndex === chunks.length - 1 ? "Finish" : "Next Chunk"}
              </Button>
            </div>
          </>
        )}

        {/* ========== DONE VIEW ========== */}
        {view === "done" && (
          <CompletionScreen
            chunkCount={chunks.length}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}

export default function ToolPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <LoadingDots />
      </div>
    }>
      <ToolContent />
    </Suspense>
  );
}
