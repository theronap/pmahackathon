# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StudyLens is a Next.js 16 (App Router) web application that transforms dense academic text into digestible formats for students with ADHD and anxiety. It uses React 19, TypeScript, Tailwind CSS 4, and the Vercel AI SDK with Anthropic's Claude API.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, Next.js core-web-vitals + typescript)
```

## Architecture

### Four output formats

- **Conversation** — AI-powered with streaming; calls `POST /api/reformat` with `streamText()`; two styles: tutor or study-group. Partial JSON parsed in real-time via `stream-parser.ts`.
- **Quiz** — AI-powered; calls `POST /api/reformat` with `generateText()`; generates 5-8 mixed multiple-choice and short-answer questions with interactive checking, scoring, and explanations.
- **Bionic Reading** — Client-side only; bolds word prefixes using algorithm in `src/lib/bionic.ts`.
- **RSVP** — Client-side only; word-by-word speed reader (100-600 WPM) with keyboard controls (Space play/pause, arrow keys skip, R reset) and sentence-aware pausing.

### Request flow

- **Conversation:** `/tool` page → `POST /api/reformat` → `streamText()` with Claude (`claude-sonnet-4-5-20250929`) → streamed response → `parsePartialConversation()` → rendered by `ChatBubbleRenderer`
- **Quiz:** `/tool` page → `POST /api/reformat` → `generateText()` with Claude → JSON response → `QuizQuestion[]` → rendered by `QuizRenderer`
- **Bionic / RSVP:** Computed entirely client-side, no API call.

### State persistence

The `/tool` page persists state to localStorage:
- `studylens-state` — User preferences (input text, format, conversation style, typing indicator toggle)
- `studylens-result` — Cached last result for quick retrieval
- Uses a `hydrated` flag to avoid SSR mismatches

### Key directories

- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/reformat/route.ts` — Single API endpoint; handles "conversation" (streaming) and "quiz" (standard) formats
- `src/components/renderers/` — Format-specific output renderers (bionic, chat-bubble, quiz, rsvp)
- `src/components/layout/` — Header with navigation
- `src/components/ui/` — Shared UI primitives (button, card, loading)
- `src/lib/llm/` — LLM provider setup (`provider.ts`) and prompt templates (`prompts.ts`)
- `src/lib/stream-parser.ts` — Partial JSON parser for real-time streaming of conversation responses
- `src/lib/bionic.ts` — Bionic reading word-splitting algorithm
- `src/types/index.ts` — All shared TypeScript types

### Key types

- `OutputFormat`: `"conversation" | "bionic" | "rsvp" | "quiz"`
- `ConversationStyle`: `"tutor" | "study-group"`
- `Speaker`, `DialogueLine` — Conversation rendering
- `QuizQuestion` — `type: "multiple-choice" | "short-answer"` with options, correctIndex, sampleAnswer, explanation
- `ReformatResult` — Union of `ConversationResult | BionicResult | RSVPResult | QuizResult`

### Conventions

- Path alias: `@/*` maps to `./src/*`
- Styling: Tailwind CSS 4 with dark theme (gray-950 backgrounds, teal-400 accents)
- Font: Inter via `next/font/google`
- Class merging: `cn()` utility from `src/lib/utils.ts` (wraps `clsx`)
- API: `streamText()` for conversation, `generateText()` for quiz; temperature 0.7, maxOutputTokens 4096
- LLM prompts enforce strict JSON output format with speakers/dialogue arrays (conversation) or questions array (quiz)
- State management: React hooks only (useState, useEffect, useRef, useCallback) — no external state library
- Max input: 15,000 characters
- Button component: 3 variants (primary, secondary, ghost), 3 sizes (sm, md, lg)

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local` for the conversation and quiz format API routes.
