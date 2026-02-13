# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

teachMe is a Next.js 16 (App Router) web application that transforms dense academic text into digestible formats for students with ADHD. It uses React 19, TypeScript, Tailwind CSS 4, the Vercel AI SDK with Anthropic's Claude API, and Supabase for auth, database, and file storage.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, Next.js core-web-vitals + typescript)
```

## Architecture

### Authentication & Data Layer (Supabase)

- **Auth**: Email/password via Supabase Auth. Middleware (`src/middleware.ts`) refreshes sessions and protects `/tool` and `/api/*` routes.
- **Database**: PostgreSQL via Supabase. `profiles` table stores user preferences; `sessions` table stores each reformat action (input, format, result).
- **Storage**: Supabase Storage bucket `uploads` for file uploads (PDF, DOCX, TXT). RLS ensures users only access their own files.
- **Client factories**: `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server). Always call `createClient()` inside event handlers or `useEffect`, never at module/render scope.
- **DB helpers**: `src/lib/db/profile.ts` (getProfile, updatePreferences) and `src/lib/db/sessions.ts` (saveSession, getSessions, getSession, deleteSession).
- **SQL migration**: `supabase/migration.sql` — run in Supabase SQL Editor to set up tables, RLS policies, triggers, and storage bucket.

### Four output formats

- **Conversation** — AI-powered with streaming; calls `POST /api/reformat` with `streamText()`; two styles: tutor or study-group. Partial JSON parsed in real-time via `stream-parser.ts`.
- **Quiz** — AI-powered; calls `POST /api/reformat` with `generateText()`; generates 5-8 mixed multiple-choice and short-answer questions with interactive checking, scoring, and explanations.
- **Bionic Reading** — Client-side only; bolds word prefixes using algorithm in `src/lib/bionic.ts`.
- **RSVP** — Client-side only; word-by-word speed reader (100-600 WPM) with keyboard controls (Space play/pause, arrow keys skip, R reset) and sentence-aware pausing.

### Request flow

- **Conversation:** `/tool` page → `POST /api/reformat` (auth gated) → `streamText()` with Claude (`claude-sonnet-4-5-20250929`) → streamed response → `parsePartialConversation()` → rendered by `ChatBubbleRenderer` → session saved to DB
- **Quiz:** `/tool` page → `POST /api/reformat` (auth gated) → `generateText()` with Claude → JSON response → `QuizQuestion[]` → rendered by `QuizRenderer` → session saved to DB
- **Bionic / RSVP:** Computed entirely client-side, no API call. Session still saved to DB.
- **File upload:** `/tool` page → `POST /api/upload` → validates type/size → uploads to Supabase Storage → extracts text (pdf-parse, mammoth, or utf-8) → returns extracted text

### State persistence

User preferences (format, style, typing indicator) are stored in the `profiles` table and loaded on mount. Each reformat action is saved as a `sessions` row with input text, source, format, and full result. No localStorage is used.

### Auth pages

- `/login` — Email/password sign in
- `/signup` — Email/password sign up with email confirmation flow
- `/auth/callback` — Code exchange for email confirmation
- Auth pages use a centered layout via `src/app/(auth)/layout.tsx`

### Key directories

- `src/app/` — Next.js App Router pages and API routes
- `src/app/(auth)/` — Login and signup pages
- `src/app/api/reformat/route.ts` — Reformat endpoint (auth gated); handles "conversation" (streaming) and "quiz" (standard)
- `src/app/api/upload/route.ts` — File upload endpoint (auth gated); PDF/DOCX/TXT parsing
- `src/app/auth/callback/route.ts` — Auth code exchange
- `src/components/renderers/` — Format-specific output renderers (bionic, chat-bubble, quiz, rsvp)
- `src/components/layout/` — Header with navigation and auth state
- `src/components/ui/` — Shared UI primitives (button, card, loading)
- `src/components/file-upload.tsx` — File upload drop zone component
- `src/lib/supabase/` — Supabase client factories (browser and server)
- `src/lib/db/` — Database helper functions (profile, sessions)
- `src/lib/llm/` — LLM provider setup (`provider.ts`) and prompt templates (`prompts.ts`)
- `src/lib/stream-parser.ts` — Partial JSON parser for real-time streaming of conversation responses
- `src/lib/bionic.ts` — Bionic reading word-splitting algorithm
- `src/types/index.ts` — All shared TypeScript types (including Profile, Session)

### Key types

- `OutputFormat`: `"conversation" | "bionic" | "rsvp" | "quiz"`
- `ConversationStyle`: `"tutor" | "study-group"`
- `Speaker`, `DialogueLine` — Conversation rendering
- `QuizQuestion` — `type: "multiple-choice" | "short-answer"` with options, correctIndex, sampleAnswer, explanation
- `ReformatResult` — Union of `ConversationResult | BionicResult | RSVPResult | QuizResult`
- `Profile` — Maps to `profiles` table (preferences per user)
- `Session` — Maps to `sessions` table (reformat history per user)

### Conventions

- Path alias: `@/*` maps to `./src/*`
- Styling: Tailwind CSS 4 with dark theme (gray-950 backgrounds, teal-400 accents)
- Font: Inter via `next/font/google`
- Class merging: `cn()` utility from `src/lib/utils.ts` (wraps `clsx`)
- API: `streamText()` for conversation, `generateText()` for quiz; temperature 0.7, maxOutputTokens 4096
- LLM prompts enforce strict JSON output format with speakers/dialogue arrays (conversation) or questions array (quiz)
- State management: React hooks only (useState, useEffect, useRef, useCallback) — no external state library
- Supabase clients: Always instantiate inside useEffect/event handlers, never at render scope (prevents SSR issues)
- Max input: 15,000 characters
- Max file upload: 10 MB (PDF, DOCX, TXT)
- Button component: 3 variants (primary, secondary, ghost), 3 sizes (sm, md, lg)

## Environment

Requires these environment variables in `.env.local`:
- `ANTHROPIC_API_KEY` — For conversation and quiz format API routes
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (for admin operations if needed)

## Setup

1. Create a Supabase project at https://supabase.com
2. Copy the project URL and keys into `.env.local`
3. Run `supabase/migration.sql` in the Supabase SQL Editor to create tables, RLS policies, and storage bucket
4. `npm install && npm run dev`
