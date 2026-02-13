"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + final);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access and try again.");
      } else if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Restart if still recording (browser may stop after silence)
      if (recognitionRef.current === recognition && isRecording) {
        try {
          recognition.start();
        } catch {
          // already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText("");
  }, []);

  const handleDone = useCallback(() => {
    stopRecording();
    const fullText = transcript.trim();
    if (fullText) {
      onTranscript(fullText);
    }
  }, [transcript, stopRecording, onTranscript]);

  const handleClear = useCallback(() => {
    setTranscript("");
    setInterimText("");
  }, []);

  if (!supported) {
    return (
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 text-center">
        <p className="text-gray-400 text-sm">
          Voice recording is not supported in this browser. Try Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl font-medium text-sm hover:bg-red-500/30 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-all cursor-pointer"
          >
            <span className="h-3 w-3 rounded-sm bg-white animate-pulse" />
            Stop Recording
          </button>
        )}

        {transcript && (
          <>
            <button
              onClick={handleDone}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-xl transition-all cursor-pointer"
            >
              Use Transcript
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 text-gray-400 hover:text-gray-300 text-sm transition-all cursor-pointer"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Live recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Listening... speak clearly into your microphone
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Live transcript preview */}
      {(transcript || interimText) && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 leading-relaxed max-h-48 overflow-y-auto">
          {transcript}
          {interimText && (
            <span className="text-gray-500">{interimText}</span>
          )}
        </div>
      )}
    </div>
  );
}
