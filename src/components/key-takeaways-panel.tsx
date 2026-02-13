"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading";

interface KeyTakeawaysData {
  takeaways: string[];
  definitions: { term: string; definition: string }[];
  summary: string;
}

interface KeyTakeawaysPanelProps {
  chunkText: string;
  demo?: boolean;
}

export function KeyTakeawaysPanel({ chunkText, demo }: KeyTakeawaysPanelProps) {
  const [data, setData] = useState<KeyTakeawaysData | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const lastChunkRef = useRef("");

  useEffect(() => {
    if (!chunkText || chunkText === lastChunkRef.current) return;
    lastChunkRef.current = chunkText;
    setData(null);
    setLoading(true);

    fetch("/api/takeaways", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunkText, ...(demo && { demo: true }) }),
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chunkText, demo]);

  return (
    <Card className="p-4 h-fit sticky top-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full text-left cursor-pointer"
      >
        <h3 className="text-sm font-semibold text-[var(--color-body)] uppercase tracking-wider">
          Study Notes
        </h3>
        <svg
          className={`h-4 w-4 text-[var(--color-muted)] transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <LoadingDots />
              <span className="text-xs text-[var(--color-muted)]">Extracting notes...</span>
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              {data.summary && (
                <div>
                  <h4 className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                    Summary
                  </h4>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">{data.summary}</p>
                </div>
              )}

              {/* Key Takeaways */}
              {data.takeaways.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                    Key Takeaways
                  </h4>
                  <ul className="space-y-1.5">
                    {data.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-text)]">
                        <span className="text-brand-500 mt-0.5 flex-shrink-0">&#8226;</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Definitions */}
              {data.definitions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                    Key Terms
                  </h4>
                  <dl className="space-y-2">
                    {data.definitions.map((d, i) => (
                      <div key={i}>
                        <dt className="text-sm font-medium text-[var(--color-heading)]">{d.term}</dt>
                        <dd className="text-xs text-[var(--color-body)] leading-relaxed mt-0.5">{d.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
