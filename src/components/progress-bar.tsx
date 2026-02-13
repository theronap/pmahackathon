"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
        <span>
          Chunk {current + 1} of {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
