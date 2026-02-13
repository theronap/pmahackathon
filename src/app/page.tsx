import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const UNIVERSITIES = ["Stanford", "MIT", "UCLA", "NYU", "Georgia Tech", "UMich"];

const FEATURES = [
  {
    eyebrow: "Conversation Mode",
    title: "Learn through dialogue",
    body: "Dense paragraphs become a natural back-and-forth between a tutor and student. Concepts click when you hear them explained like a real conversation.",
    align: "left" as const,
    mockup: (
      <div className="space-y-3">
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#1e3a64] flex items-center justify-center text-xs font-bold text-[#b8c4da]">T</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#162340] border border-[#1e3a64] px-4 py-3 text-sm text-[#b8c4da] leading-relaxed max-w-[280px]">
            Think of mitochondria as tiny power plants inside your cells. What do power plants produce?
          </div>
        </div>
        <div className="flex gap-3 items-start justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-[#1a2a4a] border border-[#243656] px-4 py-3 text-sm text-[#e2e8f4] leading-relaxed max-w-[280px]">
            Energy! So mitochondria make energy for the cell?
          </div>
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#2a1a0a] flex items-center justify-center text-xs font-bold text-[#fb923c]">S</div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#1e3a64] flex items-center justify-center text-xs font-bold text-[#b8c4da]">T</div>
          <div className="rounded-2xl rounded-tl-sm bg-[#162340] border border-[#1e3a64] px-4 py-3 text-sm text-[#b8c4da] leading-relaxed max-w-[280px]">
            Exactly! They convert glucose into ATP — the energy currency your cells spend.
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Bionic Reading",
    title: "Your eyes find the rhythm",
    body: "The first few letters of each word are bolded, creating visual anchors that guide your eyes through text faster. Your brain fills in the rest automatically.",
    align: "right" as const,
    mockup: (
      <div className="space-y-3 text-[15px] leading-relaxed text-[#8494b2]">
        <p>
          <span className="font-bold text-[#e2e8f4]">The</span> mitochon<span className="font-bold text-[#e2e8f4]">dria</span> is{" "}
          <span className="font-bold text-[#e2e8f4]">a</span> membrane-bou<span className="font-bold text-[#e2e8f4]">nd</span>{" "}
          <span className="font-bold text-[#e2e8f4]">org</span>anelle{" "}
          <span className="font-bold text-[#e2e8f4]">fou</span>nd in{" "}
          <span className="font-bold text-[#e2e8f4]">the</span> cytop<span className="font-bold text-[#e2e8f4]">lasm</span> of{" "}
          <span className="font-bold text-[#e2e8f4]">euk</span>aryotic{" "}
          <span className="font-bold text-[#e2e8f4]">cel</span>ls.
        </p>
        <p>
          <span className="font-bold text-[#e2e8f4]">It</span> gene<span className="font-bold text-[#e2e8f4]">rates</span>{" "}
          <span className="font-bold text-[#e2e8f4]">mo</span>st of{" "}
          <span className="font-bold text-[#e2e8f4]">the</span> cell&apos;s{" "}
          <span className="font-bold text-[#e2e8f4]">sup</span>ply of{" "}
          <span className="font-bold text-[#e2e8f4]">ade</span>nosine{" "}
          <span className="font-bold text-[#e2e8f4]">tri</span>phosphate,{" "}
          <span className="font-bold text-[#e2e8f4]">us</span>ed as{" "}
          <span className="font-bold text-[#e2e8f4]">a</span> source{" "}
          <span className="font-bold text-[#e2e8f4]">of</span> chemical{" "}
          <span className="font-bold text-[#e2e8f4]">ene</span>rgy.
        </p>
      </div>
    ),
  },
  {
    eyebrow: "Quiz Mode",
    title: "Test what you actually know",
    body: "Auto-generated questions with instant feedback and explanations. Find the gaps in your understanding before the exam does.",
    align: "left" as const,
    mockup: (
      <div className="space-y-3">
        <div className="text-xs font-medium text-[#fb923c] mb-1">Question 1 of 5</div>
        <p className="text-sm text-[#e2e8f4] font-medium leading-relaxed">
          What is the primary function of mitochondria in eukaryotic cells?
        </p>
        <div className="space-y-2 pt-1">
          {["Protein synthesis", "ATP production", "DNA replication", "Cell division"].map((opt, i) => (
            <div
              key={opt}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border"
              style={{
                borderColor: i === 1 ? "#22c55e" : "#1e3a64",
                backgroundColor: i === 1 ? "rgba(34,197,94,0.08)" : "#162340",
                color: i === 1 ? "#4ade80" : "#b8c4da",
              }}
            >
              <div
                className="h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                style={{
                  borderColor: i === 1 ? "#22c55e" : "#2a3f62",
                  color: i === 1 ? "#22c55e" : "#8494b2",
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
    align: "right" as const,
    mockup: (
      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-xs text-[#8494b2] mb-4 tracking-wide uppercase">280 WPM</div>
        <div className="text-4xl font-display font-normal text-[#e2e8f4] tracking-tight">
          mitochondria
        </div>
        <div className="flex items-center gap-4 mt-6">
          <div className="h-8 w-8 rounded-full border border-[#1e3a64] flex items-center justify-center text-[#8494b2]">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#fb923c]/20 flex items-center justify-center text-[#fb923c]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          </div>
          <div className="h-8 w-8 rounded-full border border-[#1e3a64] flex items-center justify-center text-[#8494b2]">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        <div className="w-48 h-1 bg-[#1e3a64] rounded-full mt-5 overflow-hidden">
          <div className="w-2/5 h-full bg-[#fb923c]/60 rounded-full" />
        </div>
      </div>
    ),
  },
];

const STATS = [
  { value: "4", label: "learning formats" },
  { value: "<10s", label: "to transform" },
  { value: "100%", label: "free to use" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(251,146,60,0.08),_transparent)]" />
        {/* Breathing glow orb */}
        <div className="hero-glow absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(251,146,60,0.12)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fb923c]/10 border border-[#fb923c]/20 text-[#fb923c] text-sm font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fb923c] animate-pulse" />
            Built for how your brain actually works
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-[1.1] mb-6 tracking-tight">
            Study less.
            <br />
            <span className="text-[#fb923c]">Understand more.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#8494b2] max-w-2xl mx-auto mb-12 leading-relaxed">
            Paste your lecture notes, textbook excerpts, or syllabi and get them
            back in formats designed to reduce cognitive load — conversation,
            bionic reading, speed reading, and quizzes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#fb923c] hover:bg-[#f97316] text-white font-semibold rounded-xl shadow-lg shadow-[#fb923c]/20 transition-all duration-200 text-lg"
            >
              Start learning
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/try"
              className="inline-flex items-center gap-2 px-6 py-3 text-[#b8c4da] hover:text-[#fb923c] font-medium transition-colors duration-200 text-base"
            >
              Try a demo
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <Reveal>
        <section className="border-t border-b border-[#1e3a64]/40 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-xs uppercase tracking-widest text-[#8494b2]/60 text-center mb-5">
              Trusted by students at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {UNIVERSITIES.map((name) => (
                <span
                  key={name}
                  className="text-sm font-medium text-[#8494b2]/80 tracking-wide"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Feature sections ── */}
      <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 space-y-24 sm:space-y-32">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.eyebrow}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text side */}
              <div className={feature.align === "right" ? "lg:order-2" : ""}>
                <span className="text-sm font-semibold text-[#fb923c] uppercase tracking-wider">
                  {feature.eyebrow}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-white mt-3 mb-4 tracking-tight leading-tight">
                  {feature.title}
                </h2>
                <p className="text-[#8494b2] text-lg leading-relaxed">
                  {feature.body}
                </p>
              </div>
              {/* Mockup side */}
              <div className={feature.align === "right" ? "lg:order-1" : ""}>
                <div className="rounded-2xl border border-[#1e3a64]/60 bg-[#0f1d32] p-6 sm:p-8">
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d32] via-[#0a1628] to-[#0a1628]" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-6 tracking-tight leading-tight">
              From overwhelmed<br />to understood
            </h2>
            <p className="text-lg text-[#8494b2] max-w-xl mx-auto mb-14 leading-relaxed">
              Different days call for different approaches. Pick the format that
              matches your energy — conversation, bionic, speed reading, or quiz.
            </p>
            <div className="grid grid-cols-3 gap-6 sm:gap-10 max-w-lg mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-display text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#8494b2]">
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
          <div className="relative rounded-2xl border border-[#1e3a64]/60 bg-[#0f1d32] px-8 py-14 sm:px-14 sm:py-18 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,_rgba(251,146,60,0.1)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 tracking-tight">
                Ready to study smarter?
              </h2>
              <p className="text-[#8494b2] mb-8 text-lg max-w-md mx-auto">
                Create a free account and transform how you learn.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#fb923c] hover:bg-[#f97316] text-white font-semibold rounded-xl shadow-lg shadow-[#fb923c]/20 transition-all duration-200 text-lg"
                >
                  Get started free
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/try"
                  className="inline-flex items-center gap-2 px-6 py-3 text-[#b8c4da] hover:text-[#fb923c] font-medium transition-colors duration-200 text-base"
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
