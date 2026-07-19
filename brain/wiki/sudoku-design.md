# Sudoku Design Decisions
updated: 2026-07-20
tags: [games, sudoku, design, architecture]
related: [classic-game-conventions, engineering-decisions, nyt-engagement-patterns]

Canonical spec: `docs/superpowers/specs/2026-07-18-sudoku-design.md`

## Implementation status

Sudoku shipped on web on 2026-07-19 and is `available` in the game registry.
The implementation includes the domain engine, deterministic generator and
technique rater, Web Worker generation, launch/play/settings/how-to-play UI,
daily and random persistence, engagement stats, and co-located tests.

## Locked v1 decisions

- Classic 9×9; Easy / Medium / Hard (technique bands, NYT-inspired)
- Daily + Endless per difficulty
- Candidates: manual toggle + optional auto-candidate (NYT-style)
- Undo, timer, live peer-conflict highlight; no mistake game-over; no hints
- Engagement stats only (no share card)
- Pasttime-native domain + feature plugin
- Runtime seeded generation + technique reject loop (Worker + daily cache)

## Difficulty = techniques, not clue count

| Level | Max techniques |
|-------|----------------|
| Easy | Naked + hidden singles |
| Medium | + pairs, locked candidates |
| Hard | + triples; reject X-Wing+ |

## Storage

- Daily: `sudoku:daily:{difficulty}:{getDailySeed()}` (matches `useDailyCompleted`)
- Endless: `sudoku:random:{difficulty}`
- Both modes resume. Persistence is guarded by `loadedKey === storageKey` so
  state from one difficulty/mode cannot be written into another slot while the
  next game is loading.
- Stored state is parsed with `parseStoredSudokuGame`; malformed or mismatched
  state is discarded and regenerated.

## Runtime and hydration patterns

- `useSudokuGame` starts with `state = null`; SSR and the first client render
  show the same loading UI.
- A valid synchronous storage read is committed in `queueMicrotask`, not by
  calling `setState` directly in the effect body. Generation remains async via
  the Worker helper.
- Every gameplay mutation flushes the active timer segment into `elapsedMs` and
  refreshes `startedAt`. This prevents elapsed time from inflating after reload
  and keeps persisted time close to the visible clock.
- The launch page follows the single-primary-action contract: daily before
  completion, random after completion. It never shows a duplicate always-on
  endless action.

## UI implementation notes

- How-to-play copy uses explicit JSX whitespace (`{" "}`) after inline
  `<strong>` labels where text continues on the next line. This avoids the
  compiler collapsing `Candidates` and `mode` into `Candidatesmode`.
