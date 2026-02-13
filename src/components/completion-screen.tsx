"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompletionScreenProps {
  onFinish: () => void;
}

export function CompletionScreen({ onFinish }: CompletionScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="p-8 sm:p-12 text-center max-w-md mx-auto" glow>
        <div className="h-16 w-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-heading)] mb-2">
          You completed this reading.
        </h2>
        <p className="text-[var(--color-body)] text-sm mb-6">
          Nice work! Ready for another?
        </p>
        <Button onClick={onFinish}>Try another mode</Button>
      </Card>
    </div>
  );
}
