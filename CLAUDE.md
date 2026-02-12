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

**Three output formats:**
- **Conversation** — AI-powered (calls Claude via `POST /api/reformat`); two styles: tutor or study-group
- **Bionic Reading** — Client-side only; bolds word prefixes using algorithm in `src/lib/bionic.ts`
- **RSVP** — Client-side only; word-by-word speed reader with play/pause controls

**Request flow for Conversation format:**
`/tool` page → `POST /api/reformat` → Claude API (`claude-sonnet-4-5-20250929`) → JSON response parsed into `DialogueLine[]` → rendered by `ChatBubbleRenderer`

Bionic and RSVP formats are computed entirely client-side with no API call.

### Key directories

- `src/app/` — Next.js App Router pages and API routes
- `src/app/api/reformat/route.ts` — Single API endpoint; only handles "conversation" format
- `src/components/renderers/` — Format-specific output renderers (bionic, chat-bubble, rsvp)
- `src/components/ui/` — Shared UI primitives (button, card, loading)
- `src/lib/llm/` — LLM provider setup (`provider.ts`) and prompt templates (`prompts.ts`)
- `src/types/index.ts` — All shared TypeScript types (`OutputFormat`, `ConversationStyle`, `Speaker`, `DialogueLine`, result types)

### Conventions

- Path alias: `@/*` maps to `./src/*`
- Styling: Tailwind CSS 4 with dark theme (gray-950 backgrounds, teal-400 accents)
- Font: Inter via `next/font/google`
- Class merging: `cn()` utility from `src/lib/utils.ts` (wraps `clsx`)
- API responses use `generateText()` from Vercel AI SDK with temperature 0.7, max 4096 tokens
- LLM prompts enforce strict JSON output format with speakers array and dialogue array

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local` for the conversation format API route.
