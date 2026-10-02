# Handoff: Shared play timer

**Status:** Done  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

## Shipped

The locked decisions below are the original packet. The product that landed differs in these ways:

- Crossword (daily persistence; endless shows a session clock only) and Klondike have the clock. Word Guess does not.
- The clock sits on the card title row, at the right.
- Idle time already spent on the page is sealed on hide, unload, or unmount, so leaving does not rewind to the last move. Time spent away is still not counted.
- The visible tick is `PlayClockReadout`. It does not re-render the board. Sudoku still flushes through `applySudokuMutation`.

New session: read this file end to end before coding. Do not re-litigate the clock rules.

When this task is done, check it off in `TASKS.md`.

---

## Problem

Crossword, Word Guess, and Klondike have no visible play clock, and they do not store elapsed time. Sudoku already does. Later tasks need Crossword seconds for rankings, and Klondike may show time on its share card.

## Locked decisions

- One shared clock behavior for Crossword, Word Guess, and Klondike. Leave Sudoku’s timer in place. Do not rewrite `applySudokuMutation`.
- Copy Sudoku’s rules:
  - Show `m:ss`, or `h:mm:ss` past 60 minutes. `formatSudokuElapsed` in `apps/web/src/features/games/sudoku/components/sudoku-play-view.tsx` is the format to share or duplicate. Prefer moving that pure formatter to a shared module and having Sudoku call it, without changing Sudoku’s tick or persistence.
  - Persist elapsed time with the game so a refresh resumes the clock.
  - While the round is playing, flush the open segment into stored elapsed time on each mutation (or on hide/unload if the game has no per-move mutation). A reload must not count time the tab was closed. See the comment on `applySudokuMutation` in `apps/web/src/features/games/sudoku/hooks/use-sudoku-game.ts`.
  - Freeze the clock when the round is won or lost. Undo back to playing, if that game has undo, continues from the frozen total. Klondike and Crossword have no undo-from-win requirement.
- Store milliseconds on the saved game. Engagement recording stays in seconds and is task 02, not this task.
- Endless and daily both show the clock.
- No server, no account.

## What to do

1. Add elapsed fields beside each game’s persisted state, and ignore missing fields on old saves (treat as `0` and start a new segment).
   - Crossword: `CrosswordGameState` in `packages/domain/games/crossword/types.ts`. The hook persists that object from `use-crossword-game.ts`.
   - Word Guess: `StoredWordGuessGame` in `packages/domain/games/word-guess/persistence.ts` (sibling of `round`, not inside the answer/guesses object, so parsers that check round shape keep working).
   - Klondike: `KlondikeState` is the stored board. Add the fields there or in a thin wrapper the hook already writes. `use-klondike-game.ts` currently stores under `solitaire:klondike:session`. Task 04 will change that key. Put the timer on the state object so it survives the key change.
2. Show the clock on each play view next to the existing status line (Crossword header, Word Guess board header, Klondike move/status badges in `klondike-play-card.tsx`).
3. Cover the Sudoku cases with tests for at least one of the three games: tick while playing, freeze on win, hydrate without adding away-time. Sudoku’s tests in `use-sudoku-game.test.tsx` (“elapsedMs increases…”, “does not inflate elapsedMs with away-time”) are the spec.

## Do not

- Do not pass `time` into `useEngagementRecorder` here. That is task 02.
- Do not change Crossword’s storage key (`crossword:${size}:${mode}`). It does not match `useDailyCompleted`. Leave that alone.
- Do not add a timer to Pyramid, TriPeaks, or FreeCell.

## Done when

- All three games show a clock that survives refresh and does not count time spent away.
- The clock stops on a finished round.
- Sudoku’s clock still behaves as before.
- Targeted unit tests cover freeze and away-time. Play each game once in the browser and confirm the clock moves, pauses across reload, and stops on win.
