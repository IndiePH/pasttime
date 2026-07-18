# Sudoku Design Decisions
updated: 2026-07-18
tags: [games, sudoku, design, architecture]
related: [classic-game-conventions, engineering-decisions, nyt-engagement-patterns]

Canonical spec: `docs/superpowers/specs/2026-07-18-sudoku-design.md`

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
