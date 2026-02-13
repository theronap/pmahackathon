"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LearningMode, TimePreference, SetupConfig } from "@/types";

const MODE_OPTIONS: { value: LearningMode; label: string; description: string; recommended?: boolean }[] = [
  { value: "groupchat", label: "Group Chat", description: "Friends discuss the material", recommended: true },
  { value: "story", label: "Story", description: "Text as a natural conversation" },
  { value: "focus", label: "Focus", description: "Bionic reading for fast scanning" },
  { value: "quiz", label: "Quiz", description: "Quiz yourself on the content" },
  { value: "rsvp", label: "RSVP", description: "One word at a time" },
  { value: "plain", label: "Plain", description: "Clean, styled paragraphs" },
];

const TIME_OPTIONS: { value: TimePreference; label: string }[] = [
  { value: "10min", label: "10 min" },
  { value: "15min", label: "15 min" },
  { value: "30min", label: "30 min" },
  { value: "custom", label: "Custom" },
  { value: "nolimit", label: "No limit" },
];

interface SetupScreenProps {
  onContinue: (config: SetupConfig) => void;
  onBack: () => void;
}

export function SetupScreen({ onContinue, onBack }: SetupScreenProps) {
  const [mode, setMode] = useState<LearningMode>("groupchat");
  const [time, setTime] = useState<TimePreference | null>(null);

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white mb-1">How do you want to learn?</h1>
      </div>

      {/* Mode selection */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Mode
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                mode === opt.value
                  ? "border-teal-400/60 bg-teal-400/10 ring-1 ring-teal-400/30"
                  : "border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/60"
              }`}
            >
              <div className="font-medium text-white text-sm flex items-center gap-2">
                {opt.label}
                {opt.recommended && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-normal">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">{opt.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Time preference */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
          Time <span className="text-gray-500 font-normal normal-case">(optional)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTime(time === opt.value ? null : opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                time === opt.value
                  ? "bg-teal-500/20 text-teal-300 border border-teal-400/40"
                  : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={() => onContinue({ mode, time })}>
          Continue
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
