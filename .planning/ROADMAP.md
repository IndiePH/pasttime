# ROADMAP: Pasttime

**Granularity:** standard

---

## Milestones

- ✅ **v1.0 Crossword Completion** — Phases 1–3 (shipped 2026-06-29)
- 🚧 **v1.1 Three Games + Engagement** — Phases 4–8 (in planning)

## Phases

<details>
<summary>✅ v1.0 Crossword Completion (Phases 1–3) — SHIPPED 2026-06-29</summary>

- [x] Phase 1: End-to-End Playable Puzzle (4/4 plans) — completed 2026-06-19
- [x] Phase 2: Full Gameplay UX (5/5 plans) — completed 2026-06-27
- [x] Phase 3: Both Modes, Size Selection, and Grid Quality (5/5 plans) — completed 2026-06-29

### Phase 1: End-to-End Playable Puzzle

**Goal**: A player opens the crossword, gets a real interlocking-word puzzle with clues, can type letters into cells, and reaches a win state when solved
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, WIN-01, PLAY-01, DATA-01, FIX-01

**Plans**: 4/4 complete

- [x] 01-01-PLAN.md
- [x] 01-02-PLAN.md
- [x] 01-03-PLAN.md
- [x] 01-04-PLAN.md

### Phase 2: Full Gameplay UX

**Goal**: Player can navigate and fill the grid entirely by keyboard, with the active cell, word, and clue highlighted, and show-errors/auto-check working against real answers
**Requirements**: PLAY-02, PLAY-03, PLAY-04, PLAY-05, WIN-02, WIN-03

**Plans**: 5/5 complete

- [x] 02-01-PLAN.md
- [x] 02-02-PLAN.md
- [x] 02-03-PLAN.md
- [x] 02-04-PLAN.md
- [x] 02-05-PLAN.md

### Phase 3: Both Modes, Size Selection, and Grid Quality

**Goal**: Player can choose daily or endless mode and grid size, receiving a shared daily puzzle or a fresh random one, with all grids meeting quality constraints
**Requirements**: GRID-01, GRID-02, GRID-03, MODE-01, MODE-02, MODE-03

**Plans**: 5/5 complete

- [x] 03-01-PLAN.md
- [x] 03-02-PLAN.md
- [x] 03-03-PLAN.md
- [x] 03-04-PLAN.md
- [x] 03-05-PLAN.md

</details>

<details open>
<summary>🚧 v1.1 Three Games + Engagement (Phases 4–8) — PLANNING</summary>

- [ ] **Phase 4: Engagement Foundation** — Shared domain package for per-game streaks and stats computation
- [ ] **Phase 5: Solitaire Klondike** — Complete playable Klondike with drag-and-drop, foundation moves, win detection
- [ ] **Phase 6: Word Guess** — Word-guessing game with visual feedback, daily+endless modes, hard mode
- [ ] **Phase 7: Streaks, Stats & Crossword Engagement** — Per-game streaks, stats pages, crossword engagement wiring
- [ ] **Phase 8: Rankings & Share Cards** — Comparative rankings and post-solve sharing for all games

### Phase 4: Engagement Foundation

**Goal**: All three games can record daily completions and retrieve streak/stats data from a shared engagement package
**Depends on**: Nothing new (reuses `@pasttime/domain/daily` for day boundary detection)
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04, ENG-05
**Success Criteria** (what must be TRUE):

  1. `StreakRecord`, `StatsSnapshot`, and `DailyCompletion` types are exported from `@pasttime/domain/engagement`
  2. `computeStreak(dailyCompletions[])` correctly returns current and longest streak from an ordered list of date timestamps
  3. `computeStats(sessionHistory[])` correctly returns win rate, total solves, and solve-time distribution
  4. Each game independently persists its streak and stats data in localStorage under separate keys
  5. Day boundary detection reuses `getDailySeed`/`isNewDay` from `@pasttime/domain/daily` — consistent with crosswords existing rollover

**Plans**: 3/3 complete

- [x] 04-01-PLAN.md — Package scaffolding, types, storage helpers (ENG-01, ENG-04)
- [x] 04-02-PLAN.md — Streak computation (ENG-02, ENG-05)
- [x] 04-03-PLAN.md — Stats computation, percentile helper (ENG-03)

### Phase 5: Solitaire Klondike

**Goal**: Players can deal and play a complete Klondike solitaire game with drag-and-drop, foundation moves, and win detection
**Depends on**: Nothing new (solitaire domain code exists)
**Requirements**: SOL-01, SOL-02, SOL-03, SOL-04, SOL-05, SOL-06, SOL-07, SOL-08, SOL-09
**Success Criteria** (what must be TRUE):

  1. Player can deal a new Klondike game and see the standard 7-column tableau layout with face-up cards
  2. Player can draw 1 or 3 cards from stock (configurable in settings)
  3. Player can drag cards between tableau columns, respecting descending-rank and alternating-color rules
  4. Player can move cards to foundation piles (A→K per suit); win detection fires when all 52 cards are on foundation
  5. Player can double-click/tap an eligible card to auto-send it to foundation; empty tableau columns accept Kings only
  6. Game state and draw-mode setting persist in localStorage across page refreshes

**Plans**: 2/2 complete

- [x] 05-01-PLAN.md — Domain changes: split modes, add drawCount, draw-3 logic (SOL-01, SOL-02, SOL-06)
- [x] 05-02-PLAN.md — UI changes: hook migration, waste fan, mode routing (SOL-02, SOL-08, SOL-09)

**UI hint**: yes

### Phase 6: Word Guess

**Goal**: Players can guess words with visual feedback, on-screen keyboard, daily + endless modes, and hard mode
**Depends on**: Nothing new (word guess domain code exists)
**Requirements**: WRD-01, WRD-02, WRD-03, WRD-04, WRD-05, WRD-06, WRD-07, WRD-08
**Success Criteria** (what must be TRUE):

  1. Player can guess a word in 6 tries with 🟩🟨⬜ per-letter visual feedback
  2. On-screen keyboard updates with per-letter state colors after each guess
  3. Player can choose word size (5–10 letters) on the launch view
  4. Daily mode gives the same seeded word to all players on a given date; endless mode gives a random word
  5. Hard mode enforces that correctly placed letters must be reused in subsequent guesses
  6. Invalid words (not in dictionary) trigger shake feedback; daily mode state persists in localStorage

**Plans**: TBD
**UI hint**: yes

### Phase 7: Streaks, Stats & Crossword Engagement

**Goal**: Crossword, solitaire, and word guess each track streaks, display stats pages, and crossword is fully integrated with the engagement layer
**Depends on**: Phase 4 (engagement package), Phase 5 (solitaire playable), Phase 6 (word guess playable)
**Requirements**: STK-01, STK-02, STK-03, STK-04, STK-05, STA-01, STA-02, STA-03, STA-04, STA-05, ENH-01, ENH-02, ENH-03
**Success Criteria** (what must be TRUE):

  1. Crossword daily completions are recorded via the engagement package; current + longest streak displays on its stats page
  2. Solitaire streak tracking infrastructure is wired (data records, streak displays) — actual accumulation awaits daily mode (deferred)
  3. Word Guess daily completions are recorded; current + longest streak displays on its stats page
  4. Streak resets when a daily puzzle is not completed before the next UTC day; all streak data persisted per game in localStorage
  5. Crossword stats page shows total solves, win rate, average solve time, streak, and comparative ranking
  6. Solitaire stats page shows total wins/games, win rate, and streak
  7. Word Guess stats page shows total solves, win rate, guess distribution, streak, and comparative ranking
  8. Each games launch view links to its stats page; all stats persist per game in localStorage

**Plans**: TBD
**UI hint**: yes

### Phase 8: Rankings & Share Cards

**Goal**: After solving, players see comparative rankings ("better than X%") and can share visual result summaries
**Depends on**: Phase 7 (needs stats data for rankings, games playable for shares)
**Requirements**: CMP-01, CMP-02, CMP-03, CMP-04, SHR-01, SHR-02, SHR-03, SHR-04, SHR-05
**Success Criteria** (what must be TRUE):

  1. After solving a daily puzzle, player sees "You are better than X% of players" for applicable metrics
  2. Stats page shows per-metric comparative ranking (e.g., "Your streak is longer than 80% of players")
  3. Pre-computed distribution data is bundled as static JSON (no server); all comparisons are anonymous ("You" only, no ranked list)
  4. After solving, player can share a visual result summary that does not reveal puzzle answers
  5. Word Guess share card uses colored emoji squares (Wordle-style); Crossword share card uses mini filled/empty grid
  6. Copy-to-clipboard share option is available

**Plans**: TBD
**UI hint**: yes

</details>

---

## Progress Table

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. End-to-End Playable Puzzle | v1.0 | 4/4 | Complete | 2026-06-19 |
| 2. Full Gameplay UX | v1.0 | 5/5 | Complete | 2026-06-27 |
| 3. Both Modes, Size Selection, and Grid Quality | v1.0 | 5/5 | Complete | 2026-06-29 |
| 4. Engagement Foundation | v1.1 | 1/3 | In Progress|  |
| 5. Solitaire Klondike | v1.1 | 2/2 | Planning | - |
| 6. Word Guess | v1.1 | 0/0 | Not started | - |
| 7. Streaks, Stats & Crossword Engagement | v1.1 | 0/0 | Not started | - |
| 8. Rankings & Share Cards | v1.1 | 0/0 | Not started | - |
