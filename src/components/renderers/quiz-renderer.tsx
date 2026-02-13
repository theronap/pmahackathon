"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/types";

interface QuizRendererProps {
  questions: QuizQuestion[];
}

export function QuizRenderer({ questions }: QuizRendererProps) {
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const totalCorrect = questions.reduce((count, q, idx) => {
    if (q.type === "multiple-choice" && revealed[idx]) {
      return count + (answers[idx] === q.correctIndex ? 1 : 0);
    }
    return count;
  }, 0);
  const totalMCRevealed = questions.filter(
    (q, idx) => q.type === "multiple-choice" && revealed[idx]
  ).length;

  function selectOption(questionIdx: number, optionIdx: number) {
    if (revealed[questionIdx]) return;
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  }

  function setShortAnswer(questionIdx: number, value: string) {
    setAnswers((prev) => ({ ...prev, [questionIdx]: value }));
  }

  function revealAnswer(questionIdx: number) {
    setRevealed((prev) => ({ ...prev, [questionIdx]: true }));
  }

  function revealAll() {
    const all: Record<number, boolean> = {};
    questions.forEach((_, idx) => {
      all[idx] = true;
    });
    setRevealed(all);
    setShowAll(true);
  }

  function resetQuiz() {
    setAnswers({});
    setRevealed({});
    setShowAll(false);
  }

  return (
    <div className="space-y-6">
      {/* Score bar */}
      {totalMCRevealed > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
          <span className="text-sm text-gray-400">Score:</span>
          <span className="text-lg font-bold text-brand-400">
            {totalCorrect}/{totalMCRevealed}
          </span>
          <span className="text-sm text-gray-500">multiple choice correct</span>
        </div>
      )}

      {questions.map((q, idx) => (
        <div
          key={idx}
          className="p-5 rounded-xl border border-gray-700 bg-gray-800/30"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-brand-500/15 text-brand-400 text-sm font-bold">
              {idx + 1}
            </span>
            <div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 mb-2 inline-block">
                {q.type === "multiple-choice" ? "Multiple Choice" : "Short Answer"}
              </span>
              <p className="text-gray-100 mt-1">{q.question}</p>
            </div>
          </div>

          {q.type === "multiple-choice" && q.options && (
            <div className="space-y-2 ml-10">
              {q.options.map((option, optIdx) => {
                const isSelected = answers[idx] === optIdx;
                const isRevealed = revealed[idx];
                const isCorrect = optIdx === q.correctIndex;

                let optionStyle = "border-gray-700 bg-gray-800/50 hover:border-gray-600";
                if (isRevealed && isCorrect) {
                  optionStyle = "border-green-500/50 bg-green-500/10";
                } else if (isRevealed && isSelected && !isCorrect) {
                  optionStyle = "border-red-500/50 bg-red-500/10";
                } else if (isSelected) {
                  optionStyle = "border-brand-400/50 bg-brand-400/10";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => selectOption(idx, optIdx)}
                    disabled={isRevealed}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${optionStyle} ${
                      isRevealed ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <span className="text-gray-400 font-medium mr-2">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span className={isRevealed && isCorrect ? "text-green-300" : "text-gray-200"}>
                      {option}
                    </span>
                    {isRevealed && isCorrect && (
                      <span className="ml-2 text-green-400 text-xs">&#10003;</span>
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <span className="ml-2 text-red-400 text-xs">&#10007;</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "short-answer" && (
            <div className="ml-10">
              <textarea
                value={(answers[idx] as string) || ""}
                onChange={(e) => setShortAnswer(idx, e.target.value)}
                placeholder="Type your answer..."
                rows={3}
                disabled={revealed[idx]}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400/50 text-sm resize-none disabled:opacity-60"
              />
              {revealed[idx] && q.sampleAnswer && (
                <div className="mt-2 p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
                  <span className="text-xs font-medium text-brand-400">Sample Answer:</span>
                  <p className="text-sm text-gray-200 mt-1">{q.sampleAnswer}</p>
                </div>
              )}
            </div>
          )}

          {/* Check / Explanation */}
          <div className="ml-10 mt-3">
            {!revealed[idx] && answers[idx] !== undefined && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => revealAnswer(idx)}
              >
                Check Answer
              </Button>
            )}
            {revealed[idx] && q.explanation && (
              <div className="mt-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <span className="text-xs font-medium text-gray-400">Explanation:</span>
                <p className="text-sm text-gray-300 mt-1">{q.explanation}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {!showAll && totalAnswered > 0 && (
          <Button variant="secondary" onClick={revealAll}>
            Reveal All Answers
          </Button>
        )}
        {totalAnswered > 0 && (
          <Button variant="ghost" onClick={resetQuiz}>
            Reset Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
