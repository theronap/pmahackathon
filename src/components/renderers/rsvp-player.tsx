"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface RSVPPlayerProps {
  words: string[];
}

/** Returns a multiplier for how long to pause on a given word. */
function getPauseMultiplier(word: string): number {
  if (/[.!?]$/.test(word)) return 2.5; // end of sentence
  if (/[;:]$/.test(word)) return 2;     // semi-colon / colon
  if (/[,]$/.test(word)) return 1.5;    // comma
  return 1;
}

export function RSVPPlayer({ words }: RSVPPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(250);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const currentWord = words[currentIndex] || "";
  const isAtEnd = currentIndex >= words.length - 1 && words.length > 0;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Schedule the next word advance with sentence-aware pausing
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length - 1) return;

    const baseMs = 60000 / wpm;
    const multiplier = getPauseMultiplier(words[currentIndex]);
    const ms = baseMs * multiplier;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= words.length - 1) {
          setIsPlaying(false);
        }
        return next;
      });
    }, ms);

    return () => {
      clearTimer();
    };
  }, [isPlaying, currentIndex, wpm, words, clearTimer]);

  const play = useCallback(() => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, words.length]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentIndex(0);
  }, [clearTimer]);

  const skipForward = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, words.length - 1));
  }, [words.length]);

  const skipBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipBack();
          break;
        case "KeyR":
          e.preventDefault();
          reset();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, play, pause, skipForward, skipBack, reset]);

  return (
    <div className="flex flex-col items-center" ref={containerRef}>
      {/* Word display */}
      <div className="w-full flex items-center justify-center min-h-[120px] mb-6 bg-gray-800/50 rounded-2xl border border-gray-700">
        <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wide select-none">
          {currentWord}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <Button onClick={skipBack} variant="ghost" disabled={currentIndex === 0}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Button>
        {!isPlaying ? (
          <Button onClick={play}>
            {currentIndex > 0 && !isAtEnd ? "Resume" : isAtEnd ? "Replay" : "Play"}
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary">
            Pause
          </Button>
        )}
        <Button onClick={skipForward} variant="ghost" disabled={isAtEnd}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Button>
        <Button onClick={reset} variant="ghost">
          Reset
        </Button>
      </div>

      {/* Speed slider */}
      <div className="w-full max-w-xs">
        <label className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Speed</span>
          <span className="font-mono text-teal-400">{wpm} WPM</span>
        </label>
        <input
          type="range"
          min={100}
          max={600}
          step={25}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="w-full accent-teal-400 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>100</span>
          <span>600</span>
        </div>
      </div>

      {/* Word count + keyboard hint */}
      <p className="text-xs text-gray-500 mt-4">
        Word {currentIndex + 1} of {words.length}
      </p>
      <p className="text-xs text-gray-600 mt-2">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">Space</kbd> play/pause
        {" "}<kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">&larr;</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">&rarr;</kbd> skip
        {" "}<kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400">R</kbd> reset
      </p>
    </div>
  );
}
