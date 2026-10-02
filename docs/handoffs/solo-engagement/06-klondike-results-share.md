# Handoff: Klondike results and share

**Status:** Ready to implement  
**Depends on:** [04 — Klondike daily deal](./04-klondike-daily-deal.md)  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

New session: read this file end to end before coding. Do not add a picture of the tableau.

When this task is done, check it off in `TASKS.md`.

---

## Problem

A Klondike win only flips a badge from “Playing” to “Won” in `klondike-play-card.tsx`. There is no results dialog and no share action. Crossword and Word Guess already use `GamePostSolveDialog`, `useDailyPostSolveDialog`, `GameShareCopyButton`, and `usePostSolveRankings`.

## Locked decisions

- Daily win only. Random wins keep the badge and the New game button. No share button on random.
- Share text is lines, not a card image and not the deck order. Include: site label (`Pasttime Solitaire`), `Daily · YYYY-MM-DD` in UTC, draw mode label (Draw 1 or Draw 3), move count, and the game URL from `buildGameShareUrl("solitaire")` when it returns one. Match the shape of `buildCrosswordShareText` / `buildWordGuessShareText` (header, blank line, facts, optional URL).
- If the shared timer from task 01 is already on the board, add one elapsed line (`m:ss` / `h:mm:ss`). Do not block this task on the timer.
- Include `ComparativeRankingsList` when task 05 has recorded a win. If rankings are empty, the dialog still shows the result and the copy button.
- Copy is `GameShareCopyButton`. Do not add a native share-sheet target or a social SDK.
- Put the text builder in `packages/domain/games/solitaire/` next to the other games’ `share.ts`, with a unit test. No React in that file.

## What to do

1. Add `buildKlondikeShareText` and a test that the text contains the date, draw mode, and move count, and does not contain card ranks or suits.
2. On daily `status === "won"`, open the post-solve dialog the way `crossword-play-view.tsx` does (`useDailyPostSolveDialog`). Title can be “Nice work!”. Description is the move count, plus time when the clock exists.
3. Footer: copy button, then Close, using `GamePostSolveActionStack`. Body: rankings list, then nothing that renders the board.
4. Leave the in-board “Won” badge so the table still shows the result after the dialog closes.

## Done when

- Winning a daily deal opens the dialog once and offers copy.
- Copied text has no card identities.
- Random wins do not open the share dialog.
- Browser check: win a daily Draw 1 and Draw 3, copy each, and confirm the draw mode and move count in the clipboard text.
