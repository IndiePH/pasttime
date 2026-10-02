# Handoff: Sudoku share card

**Status:** Ready to implement  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

New session: read this file end to end before coding. The v1 spec’s “no share card” line is superseded by this task.

When this task is done, check it off in `TASKS.md`.

---

## Problem

Sudoku’s daily win dialog already shows rankings, stats, and close (`sudoku-play-view.tsx`, `GamePostSolveDialog`). It has no copy button. The design spec `docs/superpowers/specs/2026-07-18-sudoku-design.md` left share cards out of v1. This packet adds one.

The clock and difficulty are already on the play session: `elapsedMs`, `formatSudokuElapsed`, and the difficulty prop.

## Locked decisions

- Daily win only. Endless wins keep the current stats link and do not share.
- Text only. Do not print the grid, givens, or filled digits. A grid would leak the puzzle.
- Lines, matching the other share builders: site label (`Pasttime Sudoku`), `Daily · YYYY-MM-DD` UTC, difficulty (Easy, Medium, or Hard), elapsed time via `formatSudokuElapsed`, and `buildGameShareUrl("sudoku")` when present.
- Builder lives in `packages/domain/games/sudoku/share.ts` (pure, tested). The play view only formats the elapsed string and passes it in, or the builder accepts seconds and formats `m:ss` itself. Prefer the builder accepting the already formatted clock string so domain code does not import the React view.
- Reuse `GameShareCopyButton` and `GamePostSolveActionStack`. Put Copy above the existing stats and close buttons.
- No image export, no native share sheet.

## What to do

1. Add `buildSudokuShareText` plus a test that difficulty and time appear and that no digit grid appears.
2. In `SudokuPlaySession` / the ready play view, build the text when `mode === "daily"` and `state.status === "won"`.
3. Render `GameShareCopyButton` in the dialog footer that already wraps `ComparativeRankingsList`.
4. Do not show the button for endless, or for a game still in progress.

## Done when

- A daily Sudoku win dialog offers copy, and the text is label, date, difficulty, and time.
- An endless win does not offer share.
- Unit test locks the spoiler rule. Browser check: finish a daily puzzle (or open the dialog from a won state) and copy the text.
