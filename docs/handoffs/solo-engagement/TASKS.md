# Solo engagement gaps

**Branch:** `feat/solo-engagement-gaps`  
**Delete this folder** (`docs/handoffs/solo-engagement/`) when every box below is checked. These files are a temporary work packet, not project docs.

No new service. Do not add Supabase, auth, or a live percentile API. Timers, deals, recordings, and share text stay in the browser. Rankings keep using the bundled `DISTRIBUTION_DATA` estimates.

Point a new session at this file, then at the handoff for the next unchecked task. Read that handoff end to end before coding. Do not re-open decisions marked locked there.

Out of this packet: multiplayer, Pyramid / TriPeaks / FreeCell, Sudoku hints, and replacing stub rankings with real player aggregates.

## Tasks

- [x] [01 — Shared play timer](./01-shared-play-timer.md) — Crossword and Klondike. Sudoku already has a clock. Word Guess has none.
- [ ] [02 — Crossword solve time](./02-crossword-solve-time.md) — Depends on 01. Record seconds so the existing solve-time ranking has data.
- [ ] [03 — Word Guess tries ranking](./03-word-guess-tries-ranking.md) — “Solved in N tries, better than X%” from the bundled table.
- [ ] [04 — Klondike daily deal](./04-klondike-daily-deal.md) — Seeded Draw 1 and Draw 3 from the UTC date.
- [ ] [05 — Klondike win recording](./05-klondike-win-recording.md) — Depends on 04. Streaks, win rate, and move rankings.
- [ ] [06 — Klondike results and share](./06-klondike-results-share.md) — Depends on 04. Post-solve dialog and clipboard text.
- [ ] [07 — Sudoku share card](./07-sudoku-share-card.md) — Time and difficulty only. No grid.
