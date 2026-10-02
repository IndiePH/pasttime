# Handoff: Word Guess tries ranking

**Status:** Ready to implement  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

New session: read this file end to end before coding. Do not re-litigate live player data.

When this task is done, check it off in `TASKS.md`.

---

## Problem

After a daily Word Guess win, rankings show streak and win rate only. There is no “solved in N tries, better than X%” line. The player’s own guess-distribution chart on the stats page is separate and already works.

`usePostSolveRankings` loads completions, runs `computeStats`, then `computeComparativeRankings`. Stats have no “tries used on this solve” field. `GAME_METRICS["word-guess"]` has `streak` and `winRate` only. `DISTRIBUTION_DATA["word-guess"]` has no tries array.

Guess counts are already stored: on a win, `use-word-guess-game.ts` passes a `guessDistribution` of length `maxTries` with a single `1` at index `guesses.length - 1`.

## Locked decisions

- The new line is about **this solve’s** try count, not a lifetime average. Lower is better.
- Compare it to a new stub array on `DISTRIBUTION_DATA["word-guess"]`, same style as the other stub metrics (plausible try counts from 1 through 6). Label in the same voice as the others, for example “Your guess count beats”.
- Show it on the daily post-solve dialog. The stats page keeps the existing histogram of the player’s own solves. Do not replace that histogram with a percentile.
- Do not add a server. Do not read other players.
- Hard mode and word length do not get separate distributions in this task. One shared tries table is enough.
- Losses do not get a tries percentile.

## What to do

1. Add `tries` (name it to match the metric key you add) under `packages/domain/engagement/distribution-data.ts` → `word-guess`. Values are try counts, not percents. Keep the file’s comment that these are stubs.
2. Teach `computeComparativeRankings` to score this solve. `StatsSnapshot` does not hold the current try count. Prefer an optional override argument (current tries) over stuffing a one-off into aggregate stats. `percentileForDirection` already treats `lower` as “better than values that are greater or equal.”
3. From the post-solve dialog path, pass `round.guesses.length` only when `round.status === "won"`. `usePostSolveRankings` is the natural place if the optional value can be an argument. Do not break Crossword, Solitaire, or Sudoku callers that pass only a game id.
4. Extend `packages/domain/engagement/comparative-rankings.test.ts`: fewer tries ranks above more tries against a fixed stub; a missing try count omits the line; other games’ rankings stay unchanged.

## Done when

- A daily win dialog includes a tries percentile plus the existing streak and win-rate lines when those qualify.
- A loss dialog does not show a tries percentile.
- Stats still show the guess-distribution bars.
- Unit tests cover the new metric. Browser check: win a daily puzzle and read the new line in the dialog.
