import Link from "next/link";

const FORMATS = [
  {
    title: "Conversation Mode",
    description:
      "Dense paragraphs become a natural dialogue between a tutor and student, or a study group. Concepts click when you hear them explained like a real conversation.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    tag: "AI-powered",
  },
  {
    title: "Bionic Reading",
    description:
      "The first few letters of each word are bolded, creating visual anchors that guide your eyes through the text faster. Your brain fills in the rest.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    tag: "Instant",
  },
  {
    title: "RSVP Reader",
    description:
      "Words appear one at a time at a pace you control. Eliminates the overwhelm of a wall of text and keeps your focus locked in.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    tag: "Instant",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Paste your text",
    description: "Lecture notes, syllabus sections, textbook excerpts - anything academic.",
  },
  {
    step: "2",
    title: "Pick a format",
    description: "Conversation, bionic reading, or RSVP - whatever matches your brain today.",
  },
  {
    step: "3",
    title: "Read with less stress",
    description: "Get your text back in a format that actually works for how you learn.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-gray-950 to-gray-950" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-sm font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Built for how your brain works
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Academic text,
            <br />
            <span className="text-teal-400">without the overwhelm</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste your lecture notes, syllabi, or textbook excerpts and get them
            back in formats designed to reduce cognitive load for students with
            ADHD and anxiety.
          </p>
          <Link
            href="/tool"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all duration-200 text-lg"
          >
            Try it now
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.step} className="text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-teal-500/15 text-teal-400 font-bold text-lg mb-4">
                {s.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="max-w-4xl mx-auto px-4 pb-16 sm:pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          Three ways to read
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Different days call for different approaches. Pick the format that
          matches your energy.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FORMATS.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-gray-800 bg-gray-900/60 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  {f.icon}
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20 sm:pb-28 text-center">
        <div className="p-8 sm:p-12 rounded-2xl border border-gray-800 bg-gradient-to-b from-teal-900/10 to-gray-900/50">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to study smarter?
          </h2>
          <p className="text-gray-400 mb-6">
            No signup required. Just paste and go.
          </p>
          <Link
            href="/tool"
            className="inline-flex items-center gap-2 px-7 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200"
          >
            Open StudyLens
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
