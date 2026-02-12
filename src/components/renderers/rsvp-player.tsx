"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface RSVPPlayerProps {
  words: string[];
}

export function RSVPPlayer({ words }: RSVPPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(250);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const currentWord = words[currentIndex] || "";

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Schedule the next word advance using setTimeout chaining
  useEffect(() => {
    if (!isPlaying || currentIndex >= words.length - 1) return;

    const ms = 60000 / wpm;
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
  }, [isPlaying, currentIndex, wpm, words.length, clearTimer]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentIndex(0);
  }, [clearTimer]);

  return (
    <div className="flex flex-col items-center">
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
        {!isPlaying ? (
          <Button
            onClick={play}
            disabled={currentIndex >= words.length - 1 && words.length > 0}
          >
            {currentIndex > 0 && currentIndex < words.length - 1 ? "Resume" : "Play"}
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary">
            Pause
          </Button>
        )}
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

      {/* Word count */}
      <p className="text-xs text-gray-500 mt-4">
        Word {currentIndex + 1} of {words.length}
      </p>
    </div>
  );
}
