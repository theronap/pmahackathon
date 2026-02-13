import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const FEATURES = [
  {
    eyebrow: "Group Chat",
    title: "Learn with the squad",
    body: "Your material becomes a lively group discussion between friends who break down concepts in their own words. Learning feels social, even when you\u2019re studying solo.",
    align: "left" as const,
    mockup: (
      <div className="space-y-3">
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#D4DDD6] flex items-center justify-center text-xs font-bold text-[#2D4739]">A</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#E2E8E4] border border-[#C8D4CA] px-4 py-3 text-sm text-[#3E3E3E] leading-relaxed max-w-[280px]">
            Okay so mitochondria are basically the power plants of the cell right?
          </div>
        </div>
        <div className="flex gap-3 items-start justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-[#D4DDD6] border border-[#B8C4BA] px-4 py-3 text-sm text-[#2D4739] leading-relaxed max-w-[280px]">
            Yeah! They take glucose and turn it into ATP — energy the cell can use.
          </div>
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#CCFF00]/20 flex items-center justify-center text-xs font-bold text-[#2D4739]">B</div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#D4DDD6] flex items-center justify-center text-xs font-bold text-[#2D4739]">C</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#E2E8E4] border border-[#C8D4CA] px-4 py-3 text-sm text-[#3E3E3E] leading-relaxed max-w-[280px]">
            Think of ATP like tiny rechargeable batteries. Every cell needs them.
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Story Mode",
    title: "Learn through dialogue",
    body: "Dense paragraphs become a natural back-and-forth between a tutor and student. Concepts click when you hear them explained like a real conversation.",
    align: "right" as const,
    mockup: (
      <div className="space-y-3">
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#D4DDD6] flex items-center justify-center text-xs font-bold text-[#3E3E3E]">T</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#E2E8E4] border border-[#C8D4CA] px-4 py-3 text-sm text-[#3E3E3E] leading-relaxed max-w-[280px]">
            Think of mitochondria as tiny power plants inside your cells. What do power plants produce?
          </div>
        </div>
        <div className="flex gap-3 items-start justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-[#D4DDD6] border border-[#B8C4BA] px-4 py-3 text-sm text-[#2D4739] leading-relaxed max-w-[280px]">
            Energy! So mitochondria make energy for the cell?
          </div>
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#CCFF00]/20 flex items-center justify-center text-xs font-bold text-[#2D4739]">S</div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#D4DDD6] flex items-center justify-center text-xs font-bold text-[#3E3E3E]">T</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#E2E8E4] border border-[#C8D4CA] px-4 py-3 text-sm text-[#3E3E3E] leading-relaxed max-w-[280px]">
            Exactly! They convert glucose into ATP — the energy currency your cells spend.
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Focus Mode",
    title: "Your eyes find the rhythm",
    body: "The first few letters of each word are bolded, creating visual anchors that guide your eyes through text faster. Your brain fills in the rest automatically.",
    align: "left" as const,
    mockup: (
      <div className="space-y-3 text-[15px] leading-relaxed text-[#5A6B5E]">
        <p>
          <span className="font-bold text-[#2D4739]">The</span> mitochon<span className="font-bold text-[#2D4739]">dria</span> is{" "}
          <span className="font-bold text-[#2D4739]">a</span> membrane-bou<span className="font-bold text-[#2D4739]">nd</span>{" "}
          <span className="font-bold text-[#2D4739]">org</span>anelle{" "}
          <span className="font-bold text-[#2D4739]">fou</span>nd in{" "}
          <span className="font-bold text-[#2D4739]">the</span> cytop<span className="font-bold text-[#2D4739]">lasm</span> of{" "}
          <span className="font-bold text-[#2D4739]">euk</span>aryotic{" "}
          <span className="font-bold text-[#2D4739]">cel</span>ls.
        </p>
        <p>
          <span className="font-bold text-[#2D4739]">It</span> gene<span className="font-bold text-[#2D4739]">rates</span>{" "}
          <span className="font-bold text-[#2D4739]">mo</span>st of{" "}
          <span className="font-bold text-[#2D4739]">the</span> cell&apos;s{" "}
          <span className="font-bold text-[#2D4739]">sup</span>ply of{" "}
          <span className="font-bold text-[#2D4739]">ade</span>nosine{" "}
          <span className="font-bold text-[#2D4739]">tri</span>phosphate,{" "}
          <span className="font-bold text-[#2D4739]">us</span>ed as{" "}
          <span className="font-bold text-[#2D4739]">a</span> source{" "}
          <span className="font-bold text-[#2D4739]">of</span> chemical{" "}
          <span className="font-bold text-[#2D4739]">ene</span>rgy.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "Quiz Mode",
    title: "Test what you actually know",
    body: "Auto-generated questions with instant feedback and explanations. Find the gaps in your understanding before the exam does.",
    align: "right" as const,
    mockup: (
      <div className="space-y-3">
        <div className="text-xs font-medium text-[#2D4739] mb-1">Question 1 of 5</div>
        <p className="text-sm text-[#2D4739] font-medium leading-relaxed">
          What is the primary function of mitochondria in eukaryotic cells?
        </p>
        <div className="space-y-2 pt-1">
          {["Protein synthesis", "ATP production", "DNA replication", "Cell division"].map((opt, i) => (
            <div
              key={opt}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border"
              style={{
                borderColor: i === 1 ? "#22c55e" : "#C8D4CA",
                backgroundColor: i === 1 ? "rgba(34,197,94,0.08)" : "#E2E8E4",
                color: i === 1 ? "#16a34a" : "#3E3E3E",
              }}
            >
              <div
                className="h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                style={{
                  borderColor: i === 1 ? "#22c55e" : "#B8C4BA",
                  color: i === 1 ? "#22c55e" : "#5A6B5E",
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              {opt}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    eyebrow: "RSVP Reader",
    title: "One word at a time",
    body: "Words appear at a pace you control, eliminating the overwhelm of a wall of text. Keeps your focus locked in without distractions.",
    align: "left" as const,
    mockup: (
      <div className="flex flex-col items-center justify-center py-6">
        {/* Fixation triangle marker */}
        <div className="text-[#CCFF00] text-xs mb-1 select-none" aria-hidden="true">&#9662;</div>
        {/* Word with ORP anchor — "mitochondria" (12 chars) → anchor index 3 = "o" */}
        <div className="flex justify-center text-4xl font-mono font-bold tracking-wide">
          <span className="text-right text-[#2D4739]" style={{ width: "6ch" }}>
            mit
          </span>
          <span className="text-[#CCFF00]">o</span>
          <span className="text-left text-[#2D4739]" style={{ width: "12ch" }}>
            chondria
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-[#D4DDD6] rounded-full mt-6 overflow-hidden">
          <div className="w-2/5 h-full bg-[#CCFF00] rounded-full" />
        </div>
        {/* WPM label */}
        <div className="text-xs text-[#5A6B5E] mt-3 tracking-wide">250 WPM</div>
      </div>
    ),
  },
  {
    eyebrow: "Plain Mode",
    title: "Just clean, readable text",
    body: "No gimmicks — your material presented with clear typography, proper spacing, and a layout that\u2019s easy on the eyes. Sometimes simple is best.",
    align: "right" as const,
    mockup: (
      <div className="space-y-4 text-[15px] leading-relaxed text-[#3E3E3E]">
        <h3 className="text-base font-semibold text-[#2D4739]">Cellular Respiration</h3>
        <p>
          The mitochondria is a membrane-bound organelle found in the cytoplasm of eukaryotic cells. It generates most of the cell&apos;s supply of adenosine triphosphate, used as a source of chemical energy.
        </p>
        <p>
          This process, known as cellular respiration, converts biochemical energy from nutrients into ATP, which powers most cellular functions.
        </p>
      </div>
    ),
  },
];

const STATS = [
  { value: "6", label: "learning formats" },
  { value: "<10s", label: "to transform" },
  { value: "100%", label: "free to use" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(204,255,0,0.08),_transparent)]" />
        {/* Breathing glow orb */}
        <div className="hero-glow absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(204,255,0,0.10)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(204,255,0,0.12)] border border-[rgba(204,255,0,0.25)] text-[#2D4739] text-sm font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
            Built for how your brain actually works
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-[#2D4739] leading-[1.1] mb-6 tracking-tight">
            Study less.
            <br />
            <span style={{ textShadow: "0 0 40px rgba(204,255,0,0.3)" }}>Understand more.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#5A6B5E] max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste your lecture notes, textbook excerpts, or syllabi and get them
            back in six formats designed to reduce cognitive load — group chat,
            story mode, focus reading, quizzes, speed reading, and plain text.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#CCFF00] hover:bg-[#B8E600] text-[#2D4739] font-semibold rounded-xl shadow-lg shadow-[rgba(204,255,0,0.20)] transition-all duration-200 text-lg"
            >
              Start learning
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/try"
              className="inline-flex items-center gap-2 px-6 py-3 text-[#5A6B5E] hover:text-[#2D4739] font-medium transition-colors duration-200 text-base"
            >
              Try a demo
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature sections ── */}
      <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 space-y-24 sm:space-y-32">
        {FEATURES.map((feature) => (
          <Reveal key={feature.eyebrow}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text side */}
              <div className={feature.align === "right" ? "lg:order-2" : ""}>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D4739] uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-sm bg-[#CCFF00]" />
                  {feature.eyebrow}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-[#2D4739] mt-3 mb-4 tracking-tight leading-tight">
                  {feature.title}
                </h2>
                <p className="text-[#5A6B5E] text-lg leading-relaxed">
                  {feature.body}
                </p>
              </div>
              {/* Mockup side */}
              <div className={feature.align === "right" ? "lg:order-1" : ""}>
                <div className="rounded-2xl border border-[#C8D4CA] bg-[#EFF2F0] p-6 sm:p-8">
                  {feature.mockup}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── Transformation section ── */}
      <Reveal>
        <section className="relative py-20 sm:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-[#EFF2F0] via-[#F9F9F7] to-[#F9F9F7]" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#2D4739] mb-6 tracking-tight leading-tight">
              From overwhelmed<br />to understood
            </h2>
            <p className="text-lg text-[#5A6B5E] max-w-xl mx-auto mb-14 leading-relaxed">
              Different days call for different approaches. Pick the format that
              matches your energy — group chat, story, focus, quiz, speed reading, or plain.
            </p>
            <div className="grid grid-cols-3 gap-6 sm:gap-10 max-w-lg mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-display text-[#2D4739] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#5A6B5E]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Final CTA ── */}
      <Reveal>
        <section className="max-w-4xl mx-auto px-4 pb-24 sm:pb-32">
          <div className="relative rounded-2xl border border-[#C8D4CA] bg-[#EFF2F0] px-8 py-14 sm:px-14 sm:py-18 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,_rgba(204,255,0,0.10)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl text-[#2D4739] mb-4 tracking-tight">
                Ready to study smarter?
              </h2>
              <p className="text-[#5A6B5E] mb-8 text-lg max-w-md mx-auto">
                Create a free account and transform how you learn.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#CCFF00] hover:bg-[#B8E600] text-[#2D4739] font-semibold rounded-xl shadow-lg shadow-[rgba(204,255,0,0.20)] transition-all duration-200 text-lg"
                >
                  Get started free
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/try"
                  className="inline-flex items-center gap-2 px-6 py-3 text-[#5A6B5E] hover:text-[#2D4739] font-medium transition-colors duration-200 text-base"
                >
                  Try a demo first
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
