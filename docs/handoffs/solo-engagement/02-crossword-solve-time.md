# Handoff: Crossword solve time

**Status:** Done  
**Depends on:** [01 — Shared play timer](./01-shared-play-timer.md)  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

## Shipped

- A daily win stores `time` in seconds from the frozen `elapsedMs`. The value is passed only when status is `won`.
- A random-mode win does not write a daily completion.
- The post-solve dialog re-reads completions when it opens, so the solve-time line includes the win just recorded.
- The percentile still uses the bundled `DISTRIBUTION_DATA` stub. Real player aggregates are not on the roadmap.

New session: read this file end to end before coding. Do not re-litigate where the percentile comes from.

When this task is done, check it off in `TASKS.md`.

---

## Problem

Crossword rankings already include “Your solve time is faster than X%”, but daily completions never store `time`, so `averageTime` stays empty and that line never appears.

`computeStats` already averages `DailyCompletion.time` (seconds) into `StatsSnapshot.averageTime`. `GAME_METRICS.crossword` already reads `averageTime` with direction `lower`. `DISTRIBUTION_DATA.crossword.solveTime` is a stub of plausible seconds. None of that needs a new metric.

## Locked decisions

- Record seconds only for a **daily** win, through the existing `useEngagementRecorder` `time` argument. Sudoku already does `time: Math.floor(elapsedMs / 1000)` in `use-sudoku-game.ts`. Match that.
- The ranking compares the player’s **average** daily solve time to the stub table, which is what the crossword metric already does. Do not invent a separate “this puzzle only” ranking.
- Endless solves are not daily completions. Do not record them.
- Keep the stub distribution. Do not call a backend.
- Do not migrate Crossword’s play-state storage key in this task.

## What to do

1. Confirm task 01 left a persisted elapsed value on the crossword state the hook can read at the win transition.
2. In `use-crossword-game.ts`, pass that value in seconds into the existing `useEngagementRecorder({ gameId: "crossword", ... })` call. Today it omits `time`.
3. The recorder writes only when `isDaily` is true and status transitions to `won` or `lost`. A loss has no solve time. Pass `time` only for a win, or accept that `computeStats` already ignores completions without `time`.
4. Add or extend a hook test: a daily win stores a completion whose `time` is the elapsed seconds. `apps/web/src/features/games/hooks/use-engagement-recorder.ts` is the writer. Completions load from `@pasttime/domain/engagement`.
5. Confirm the stats page and the post-solve rankings list can show the solve-time line once a timed win exists. `usePostSolveRankings("crossword")` and `ComparativeRankingsList` already render whatever `computeComparativeRankings` returns.

## Done when

- Finishing a daily crossword writes `time` in seconds on that game’s completion record.
- After at least one timed daily win, stats and the post-solve dialog show the solve-time percentile.
- A random-mode win does not create a daily completion.
- Browser check: solve or force a daily win, open stats, and see average time plus the ranking line.
