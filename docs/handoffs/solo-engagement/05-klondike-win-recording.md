# Handoff: Klondike win recording

**Status:** Ready to implement  
**Depends on:** [04 — Klondike daily deal](./04-klondike-daily-deal.md)  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

New session: read this file end to end before coding.

When this task is done, check it off in `TASKS.md`.

---

## Problem

`use-klondike-game.ts` calls `useEngagementRecorder` with `isDaily: false`, so no completion is written. The stats page and the solitaire rankings (`winRate`, `moves`) stay empty. The comment in that hook says recording waits on a daily mode.

`computeStats` already turns won completions with `moves` into `totalGames`, `winRate`, `lowestMovesOnWin`, and `averageMovesOnWin`. `GAME_METRICS.solitaire` already ranks win rate (higher) and best win’s move count (lower) against `DISTRIBUTION_DATA.solitaire`.

## Locked decisions

- Record **daily** terminal games only. Random wins stay off the streak calendar.
- On a daily win, pass `moves: boardState.moves` and `isDaily: true`. Variant is the layout id (`klondike-draw1` or `klondike-draw3`), not the generic `"klondike"` string used today.
- Klondike has no loss status. Only `"playing"` and `"won"` exist. Do not invent a loss.
- If task 01 has landed, also pass `time` in seconds on the win, matching Sudoku. If the timer is not on the board yet, ship moves without blocking on the clock.
- Streak uses the existing `computeStreak` UTC-day rules. One win per date counts. Draw 1 and Draw 3 on the same day must not double-count the streak. `addCompletion` is the writer; read it and, if the same date can be inserted twice, keep a single solitaire completion per UTC date (either draw mode satisfies the day).
- Rankings stay on the stub table. No server.

## What to do

1. Flip the recorder to `isDaily: mode === "daily"` once task 04’s round mode exists. Pass `moves` from the board.
2. Confirm a win transition writes one `DailyCompletion` via `use-engagement-recorder.ts` (it records on the transition into `won`, not on every render).
3. Stats page at the solitaire stats route should then show solves, win rate, and best moves after a daily win. Rankings appear when win rate is above 0 and when `lowestMovesOnWin` is set. No new stats UI unless a field is missing from `game-stats-view.tsx` (it already renders those fields).
4. Test: daily win appends a completion with `moves` and `status: "won"`; a second render does not duplicate it; a random win writes nothing; two draw modes on the same UTC date do not create two streak days.

## Done when

- Winning today’s daily Klondike updates solitaire streak, win rate, and move stats in localStorage.
- Playing a random game does not.
- The stats page shows those numbers and the comparative lines that have data.
- Browser check: win a daily deal, open `/games/solitaire/stats`, and see a win and a streak of at least 1.
