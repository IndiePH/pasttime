# Handoff: Klondike daily deal

**Status:** Ready to implement  
**Task list:** [TASKS.md](./TASKS.md)  
**Branch:** `feat/solo-engagement-gaps`

New session: read this file end to end before coding. Do not re-litigate seeding or the launch contract.

When this task is done, check it off in `TASKS.md`.

---

## Problem

Klondike Draw 1 and Draw 3 always deal with `Math.random`. There is one save slot, `solitaire:klondike:session`, and the launch button always says “Play”. Wins are not a daily puzzle, so task 05 has nothing dated to record.

The dealer already accepts a seed. `createKlondikeGame({ seed, drawCount })` in `packages/domain/games/solitaire/klondike/game.ts` calls `shuffleKlondikeDeck`, which uses `createSeededRandom` when `seed` is a number.

## Locked decisions

- Daily and random are two round modes. Draw 1 and Draw 3 stay the layout choice. Pyramid, TriPeaks, and FreeCell stay out of scope.
- Daily seed is `hashSeed(getDailySeed(date) + drawCount * 97)` from `@pasttime/domain/daily`. Same UTC date and same draw count must deal the same board on every browser. Draw 1 and Draw 3 on the same day must not be the same layout.
- Random deals stay unseeded (`seed: null`).
- Follow the daily-mode launch contract in `docs/QUALITY-CHECKLIST.md` (section “Daily-mode launch contract”):
  - One primary action. Before the daily is finished: **Play daily puzzle** into daily mode. After `won`: **Play puzzle** into random mode.
  - No second button that also starts a game.
  - Reference: `crossword-launch-view.tsx`, `sudoku-launch-view.tsx`, `GameLaunchActions`.
- Persist daily state where `useDailyCompleted` can read a top-level `status` string. Key shape: `solitaire:daily:{mode}:{getDailySeed()}` with `mode` of `klondike-draw1` or `klondike-draw3`. `KlondikeState.status` is already `"playing"` or `"won"`. Store the state object itself under that key.
- Random key: `solitaire:random:{mode}`. Do not keep using `solitaire:klondike:session`. Old saves under that key can be ignored (fresh deal), the same way missing `drawCount` already starts over.
- Resume today’s daily if the stored board matches today’s seed and draw count. A new UTC day starts a new deal. Random resumes its own slot.
- Do not record engagement in this task. Leave `isDaily: false` until task 05.
- No server. The seed is the shared deal.

## What to do

1. Thread a round mode (`daily` | `random`) from the launch query through `solitaire-play-view.tsx` into `useKlondikeGame`. Today the hook only receives `drawCount` and always calls `createKlondikeGame({ drawCount })` with no seed (`newGame` does the same).
2. Split storage by the keys above. Guard writes with the loaded key, the way Sudoku does (`loadedKey === storageKey`), so a mode switch cannot save one board into the other slot.
3. Point `SolitaireLaunchView` at `useDailyCompleted("solitaire", mode)` and the launch contract. `mode` here is the selected Klondike layout, which is the variant segment of the storage key.
4. Domain test: two `createKlondikeGame({ seed, drawCount })` calls with the same arguments match; Draw 1 and Draw 3 seeds for the same date differ. Hook or launch test: incomplete daily shows only “Play daily puzzle”; a stored `status: "won"` on today’s key shows only the random action.

## Done when

- Two browsers (or two loads) on the same UTC date and draw count get the same opening board.
- The next UTC date deals a different board.
- Random play is a different board and does not overwrite today’s daily.
- Launch shows one play action and swaps after the daily is won.
- Browser check: start daily Draw 1, note the tableau, reload, and see the same deal. Switch to random and see a different deal. Win or set stored status and confirm the launch label swaps.
