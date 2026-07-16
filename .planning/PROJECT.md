# Pasttime

## What This Is

Pasttime is a multi-platform games hub (Next.js web on Cloudflare Workers, plus Electron desktop, Expo mobile, and an Express/WS multiplayer server) sharing a pure `@pasttime/domain` package. The crossword game is fully playable with real interlocking words from a shipped corpus, interactive grid filling, keyboard navigation, visual feedback, daily shared puzzle mode, and endless/random mode with grid size selection.

## Core Value

A player can open the crossword, read real clues, fill an interlocking grid, and have a correct solve detected — for both the daily puzzle and endless mode.

## Current State (v1.0 — Shipped)

The crossword milestone delivered:
- **Runtime generation**: Seeded-random, deterministic, in-browser — reuses daily-seed infra
- **Word+clue corpus**: Sized, deduplicated `corpus.json` merged from 4 source files
- **Interactive grid**: Click/type cell entry, NYT-style keyboard navigation, direction toggle, active-clue highlighting
- **Grid quality**: Symmetry, density, fill, and cell-check validation; 3-attempt retry; sizes 7×7–15×15 (odd)
- **Win detection**: Atomic state-updater-based detection with show-errors and auto-check preferences
- **Two modes**: Daily shared deterministic puzzle (seed from date) and endless/random (fresh random seed)
- **Rollover handling**: Focus + interval detection with non-destructive banner
- **Error boundary**: Generator failure is caught with descriptive error card

**Tests:** 65 web crossword tests · 132 domain tests · `tsc --noEmit` clean
**Timeline:** 10 days (2026-06-19 → 2026-06-29)
**Commits:** ~48 crossword-related commits

## Current Milestone: v1.1 — Three Games + Engagement

**Goal:** Ship Solitaire Klondike and Word Guess as fully playable games alongside
crossword, with a shared engagement layer providing streaks, stats, timers,
comparative rankings, and share cards — no login required, localStorage-backed.

**Progress:** Phase 4 (Engagement Foundation) shipped — shared domain package for streaks
and stats. Phase 5 (Solitaire Klondike) complete — draw-1/draw-3 modes, full drag-and-drop,
foundation moves, win detection, state persistence.

**Target features:**
- ✅ Solitaire Klondike — Klondike Draw 1 + Draw 3 modes with draw-3 waste fan
- Ship Word Guess — guess in 6 tries, keyboard, persistence (domain exists, wire UI)
- New `@pasttime/domain/engagement` package — game-agnostic streaks, stats, timer
- Per-game stats page — streak calendar, solve count, win rate, times, comparative "better than X%"
- Optional timer during play for all 3 games
- Share cards after solve — visual result summary, no spoilers
- No login/accounts (anonymous device ID + localStorage)
- No multiplayer for these 3 in this milestone

## Requirements

### Validated

- ✓ Runtime generator places real interlocking words from corpus — v1.0
- ✓ Deterministic generation (same seed → same puzzle) — v1.0
- ✓ Generated cells carry answerLetter; populated across/down clue lists — v1.0
- ✓ Fast enough for on-demand client use — v1.0
- ✓ Every letter cell belongs to both across and down (no orphans) — v1.0
- ✓ Crossing words share consistent letters — v1.0
- ✓ Proper grid spacing per size — v1.0
- ✓ Daily shared deterministic puzzle — v1.0
- ✓ Endless/random mode — v1.0
- ✓ Grid size selection in endless mode — v1.0
- ✓ Click cell + type letter — v1.0
- ✓ Keyboard navigation with auto-advance — v1.0
- ✓ Direction toggle — v1.0
- ✓ Active cell/word/clue highlighting — v1.0
- ✓ Backspace with step-back — v1.0
- ✓ Correct solve detection → win state — v1.0
- ✓ Show-errors highlights wrong letters — v1.0
- ✓ Auto-check resolves round status — v1.0
- ✓ Sized and quality-filtered corpus — v1.0
- ✓ `CrosswordClue.col` typed as `number` — v1.0

### Active

v1.1 requirements to be defined. See `.planning/REQUIREMENTS.md`.

### Out of Scope

- Build-time precomputed puzzle pools — decided against; runtime seeded generation chosen
- Crossword multiplayer / co-op solving — hub multiplayer exists but not for this milestone
- New game modes beyond daily + endless (themed packs, timed challenges, scoring/leaderboards) — defer
- Mobile (Expo) / desktop (Electron) crossword parity beyond what shared code gives for free — defer
- Login / accounts (authentication) — anonymous device ID + localStorage, no server-side identity
- Push notifications — defer to when server-side infra justifies it
- Friends / leaderboards — defer to future milestone
- Additional games beyond crossword, solitaire, word-guess
- Multiplayer for these 3 games in this milestone

## Context

**Stack:** TypeScript ESM monorepo, Next.js 16 / React 19, Tailwind v4 + shadcn/Radix, nuqs for URL state, Vitest (jsdom). Domain package pure TS (no React/IO), consumed as TS source via `transpilePackages`.

**Current crossword state (v1.0 shipped):**
- Fully playable with real interlocking words, clues, keyboard/mouse interaction
- Both daily and endless modes working with grid size selection
- Win detection, show-errors, auto-check all functional
- Error boundary and daily rollover handling in place
- 65 web + 132 domain tests, tsc clean

**Existing domain code for solitaire & word-guess:**
- Solitaire Klondike: full domain (deck, deal, game logic, rules, types)
- Word Guess: full domain (dictionary, guess evaluation, game state, persistence)
- Both have UI shells (launch view, play view components) registered in GAME_MODULES
- `useDailyCompleted` hook already exists for cross-game daily tracking
- Room/multiplayer infrastructure exists (Express/WS server, anonymous device IDs)

**Engagement pattern research saved to:** `brain/wiki/nyt-engagement-patterns.md` and `brain/wiki/percentile-ranking-patterns.md`

## Architecture Decision

**Seeded-random, runtime, in-browser generation.** A client-side generator places real interlocking words from a shipped word+clue corpus onto the grid, deterministically driven by a seed. Daily mode seeds from the date (shared, identical for all players); endless mode uses a random seed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Seeded-random runtime in-browser generation | Reuses daily-seed infra; deterministic shared daily; no build-time puzzle pool | ✓ Good |
| Reuse existing corpus as shipped dictionary | Corpus + clues already built; pipeline becomes curation not precompute | ✓ Good |
| Both daily + endless modes in Phase 3 | Grid quality hardening bundles naturally with mode completion | ✓ Good |
| FIX-01 folded into Phase 1 | Type bug blocks correct types throughout generation; zero-cost to fix | ✓ Good |
| DATA-01 in Phase 1 | Must right-size corpus before generator ships to avoid bundle bloat | ✓ Good |
| Rollover detection in CrosswordPlaySession | Keep component concerns separate from game state logic | ✓ Good |
| Error boundary for generator failures | Hooks throw during render, can't be wrapped in try-catch | ✓ Good |
| ActiveClue derived via useMemo | Direction + activeCell fully determine activeClue | ✓ Good |
| NYT key matrix for keyboard navigation | Proven UX pattern for crosswords | ✓ Good |

## Constraints

- **Tech stack**: Generation logic lives in `@pasttime/domain` (pure TS, no React/IO); UI in `apps/web` feature module. Follow existing 4-registry + hook + nuqs patterns.
- **Determinism**: Daily puzzle must be identical for all players on a given date (seed from date only).
- **Bundle**: Corpus ships to the client — sized and filtered `corpus.json` in use.
- **Quality bar**: Puzzles must be solvable with all letter cells checked and intersections consistent.

## Evolution

This document evolves at milestone transitions.

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. All shipped requirements moved to Validated
4. Context updated with current state
5. All milestone decisions added to Key Decisions

- ✓ Klondike Draw 1 mode — draw one card at a time from stock — Phase 5
- ✓ Klondike Draw 3 mode — draw three cards at a time, partial draw, waste fan — Phase 5
- ✓ Draw-3 waste pile rendered as fanned/offset stack — Phase 5
- ✓ Game state persists in localStorage per draw mode — Phase 5
- ✓ Saved state migration — missing/mismatched drawCount triggers fresh game — Phase 5
- ✓ Draw action produces screen-reader feedback — Phase 5

---
*Last updated: 2026-07-02 after Phase 5 completion*
