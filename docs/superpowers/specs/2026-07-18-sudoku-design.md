# Sudoku Game Design

**Date:** 2026-07-18  
**Status:** Draft  
**Scope:** Classic 9×9 Sudoku — domain engine, generation/rating, launch + play UI, persistence, engagement stats

---

## 1. Overview

Ship Sudoku as a first-class Pasttime solo game: classic 9×9, Easy / Medium / Hard (NYT-inspired technique bands), Daily and Endless per difficulty, NYT-style candidates (manual + optional auto-candidate), undo, timer, live peer-conflict highlighting, and local engagement stats. No hints, share cards, variants, or multiplayer in v1.

**Approach:** Pasttime-native domain engine + feature plugin (same shape as Crossword / Word Guess). Runtime seeded generation with a technique-based reject loop (Web Worker + daily cache).

---

## 2. Product requirements

| Area | Decision |
|------|----------|
| Grid | Classic 9×9 only |
| Difficulties | Easy, Medium, Hard |
| Modes | Daily + Endless, each difficulty independent |
| Notes | Candidate mode (toggle) + optional auto-candidate setting |
| Undo | Full board+candidates snapshot stack |
| Timer | Shown during play; persisted across reload |
| Mistakes | Live peer-conflict highlight; no strike limit / no game-over |
| Hints | None |
| Win follow-up | Wire `useEngagementRecorder` + existing stats page; no share card |
| Generation | Client-side seeded generate + rate + reject (approach A) |

**Out of v1:** hints, shareable result cards, 6×6 / Killer / other variants, precomputed puzzle bank, multiplayer, wrong-vs-solution “red dot” auto-check (solution is still stored for win validation).

---

## 3. Architecture

| Layer | Path | Responsibility |
|-------|------|----------------|
| Domain | `packages/domain/games/sudoku/` | Pure TS: types, generate + rate, play mutations, conflicts, persistence parsers, storage keys. **No React.** |
| Feature | `apps/web/src/features/games/sudoku/` | Launch + play UI, hooks, search params, preferences, How to Play |
| Shared | Existing game shell | `GameLaunchActions`, `useDailyCompleted`, `useEngagementRecorder`, module / settings / how-to-play registries |
| Catalog | `packages/domain/games/registry.ts` | Flip `sudoku` from `coming_soon` → `available` when playable |

### Generation

- Domain API: `generateSudoku({ difficulty, seed })`
- Pipeline: fill complete grid → carve clues (unique solution) → human-technique rate → accept if in band else reject/retry
- UI invokes generation via a **Web Worker**; show a short generating state on first open
- Cache accepted daily puzzle under the daily storage key so revisits skip regeneration
- Endless uses a fresh random seed per new game

### Storage keys

Must match the universal `useDailyCompleted` contract (not Word Guess’s `solo:` prefix):

- Daily: `sudoku:daily:{difficulty}:{getDailySeed()}`  
  e.g. `sudoku:daily:easy:20260718` — same key the launch hook reads
- Endless: `sudoku:random:{difficulty}` (one active endless slot per difficulty)

Top-level stored `status`: `"playing" | "won" | "abandoned"` (no `"lost"` — no mistake game-over).  
`useDailyCompleted` treats `won` (and `lost` if ever used) as completed.

Engagement variant string = difficulty (`"easy" | "medium" | "hard"`).

---

## 4. Domain model & difficulty

### Board

- 9×9 cells: given (immutable), empty, or player digit; optional candidate set `{1…9}`
- Puzzle includes unique `solution` (win check; not used for v1 conflict UI)
- Peer conflicts: same digit twice in a row, column, or box — highlighted live

### Actions (pure functions)

- Select cell / place digit / clear cell
- Toggle candidate (candidate mode)
- Set auto-candidates on/off — when on, fill all legal candidates and prune on place/clear
- Undo — stack of board + candidates snapshots
- Timer: UI/hook state (`startedAt` / elapsed); persisted with game so reload keeps time

### Win

Board full **and** equals solution → `status: "won"`; stop timer; record engagement.

### Difficulty bands (technique ceiling)

| Level | Solvable using at most | Reject if needs |
|-------|------------------------|-----------------|
| Easy | Naked + hidden singles | Pairs or harder |
| Medium | + naked/hidden pairs, locked candidates (pointing/claiming) | Triples / fish / chains |
| Hard | + naked/hidden triples | X-Wing and above |

Clue count is a soft target only. Accept/reject uses the technique ladder. Same `(difficulty, seed)` always yields the same puzzle.

**Human-technique solver** means an automatic logic ladder that applies human-style techniques — not manual human review.

### Generation edge cases

- Worker timeout / failure: retry UI; do not leave a half-written save
- Corrupt storage: parser returns `null` → regenerate with same daily seed (shared daily preserved)
- Attempt cap: after N rejects (implementation plan picks N, e.g. 50), accept the closest unique puzzle whose rating is ≤ target ceiling (never above). Domain tests assert Easy never requires pairs; Medium never requires triples+

---

## 5. UI / UX

### Launch (`/games/sudoku`)

- Difficulty picker: Easy / Medium / Hard
- `GameLaunchActions` for Daily + Endless
- How to Play
- Settings: default auto-candidate preference
- Daily completion via `useDailyCompleted("sudoku", difficulty)`

### Play

- Centered 9×9 with thick 3×3 box borders; Pasttime game chrome / tokens
- Selected cell + same-digit highlight for the active number
- Live peer-conflict styling
- Timer in chrome while `status === "playing"`
- Number pad 1–9 + clear
- Normal / Candidates toggle (desktop: `Space`)
- Undo; auto-candidate control in play settings
- Candidates rendered as small 1–9 marks in a 3×3 micro-grid inside the cell (NYT-style)

### Input

- Tap/click cell; keys `1–9`; `Backspace` / `Delete` clear; arrows move; `Space` toggle candidate mode
- Givens ignore place/clear

### Win

- Board locks; show elapsed time
- CTAs: stats / new endless / back to launch
- No share card

---

## 6. Data flow

1. Launch reads `difficulty` + `mode` from search params → play route  
2. Hook loads storage key; hydrate if valid; else Worker `generateSudoku({ difficulty, seed })`  
3. Daily seed = `getDailySeed()`; endless seed = secure random per new game  
4. Mutations → domain state → persist → UI  
5. Win → persist → `useEngagementRecorder`  

Timer v1: elapsed derived from persisted `startedAt` while playing (no pause UI unless shared shell already provides it).

---

## 7. Testing

Domain-first:

- Generator: uniqueness, seed stability, difficulty band acceptance  
- Rater: fixture puzzles classify as Easy / Medium / Hard correctly  
- Play: place / clear / candidates / auto-candidates / undo / win  
- Persistence: key shapes; corrupt → `null`  
- Hook smoke: hydrate + win records engagement (mirror Word Guess hook tests)

---

## 8. File sketch (implementation guide)

```
packages/domain/games/sudoku/
  types.ts
  generate.ts          # fill, carve, unique, reject loop
  rate.ts              # technique ladder
  game.ts              # place, clear, candidates, undo, win
  conflicts.ts
  persistence.ts
  settings.ts
  index.ts
  *.test.ts

apps/web/src/features/games/sudoku/
  search-params.ts
  index.ts
  hooks/use-sudoku-game.ts
  components/…         # launch, play, grid, pad, how-to-play, settings
  workers/sudoku-generate.worker.ts   # or equivalent worker entry
```

Wire into `module-registry`, settings / how-to-play registries, and flip catalog status when ready.

---

## 9. Success criteria

- Players can complete Daily and Endless Easy / Medium / Hard on web  
- Same calendar day + difficulty → same daily puzzle for all clients  
- Candidates (manual + auto) and undo work as specified  
- Conflicts highlight without ending the game  
- Wins appear in existing Sudoku stats / engagement  
- Domain tests cover generation bands, play mutations, and persistence  
- `npm run lint`, `typecheck`, `test`, and web `build` pass  
