# Requirements: Pasttime — Three Games + Engagement

**Defined:** 2026-07-01
**Core Value:** A player can open any of 3 games (crossword, solitaire, word guess), play a satisfying round, see their per-game streaks and stats, and know how they compare to the playerbase — all without logging in.

## v1.1 Requirements

Requirements for shipping Solitaire and Word Guess alongside crossword, with a shared per-game engagement layer.

### Solitaire (Klondike)

- [x] **SOL-01**: Player can deal a standard Klondike solitaire game (random shuffle)
- [x] **SOL-02**: Player can draw 1 or 3 cards from stock (configurable in settings)
- [x] **SOL-03**: Player can drag cards between tableau columns (descending, alternating colors)
- [x] **SOL-04**: Player can move cards to foundation piles (A→K per suit)
- [x] **SOL-05**: Player can double-click/tap to auto-send eligible cards to foundation
- [x] **SOL-06**: Win detection — all 52 cards moved to foundation
- [x] **SOL-07**: Empty columns accept Kings only
- [x] **SOL-08**: Player can start a new game at any time
- [x] **SOL-09**: Solitaire game state persists in localStorage (survives refresh)

### Word Guess

- [x] **WRD-01**: Player can guess a word in 6 tries with 🟩🟨⬜ visual feedback per letter
- [x] **WRD-02**: On-screen keyboard updates with per-letter state colors
- [x] **WRD-03**: Player can choose word size (5–10 letters) on the launch view
- [x] **WRD-04**: Daily mode — one shared word per day (seed from date, deterministic)
- [x] **WRD-05**: Endless/random mode — random word on demand with chosen length
- [x] **WRD-06**: Hard mode — correctly placed letters must be reused in subsequent guesses
- [x] **WRD-07**: Daily mode game state persists in localStorage; endless mode is ephemeral
- [x] **WRD-08**: Invalid word detection (not in dictionary) shows visual feedback (shake)

### Engagement Package (`@pasttime/domain/engagement`)

Shared domain package for per-game streak and stats computation. Game-agnostic — each game uses it independently.

- [x] **ENG-01**: Engagement package exports types for `StreakRecord`, `StatsSnapshot`, and `DailyCompletion`
- [x] **ENG-02**: `computeStreak(dailyCompletions[])` returns current and longest streak from an ordered list of daily completion timestamps
- [x] **ENG-03**: `computeStats(sessionHistory[])` returns win rate, total solves, and solve-time distribution from session data
- [x] **ENG-04**: Streak and stats data persist per game in localStorage (separate keys per game)
- [x] **ENG-05**: Day boundary detection reuses `getDailySeed`/`isNewDay` from `@pasttime/domain/daily`

### Per-Game Streaks

- [ ] **STK-01**: Crossword tracks its own daily streak (current + longest)
- [ ] **STK-02**: Solitaire tracks its own daily streak (if daily mode added in future — for now, random-mode solitaire does not have streaks)
- [ ] **STK-03**: Word Guess tracks its own daily streak (current + longest)
- [ ] **STK-04**: Streak lost when a daily puzzle is not completed before the next UTC day
- [ ] **STK-05**: Streak data persisted per game in localStorage

### Per-Game Stats

- [ ] **STA-01**: Crossword stats page — total solves, win rate, average solve time, streak, comparative ranking
- [ ] **STA-02**: Solitaire stats page — total wins/games, win rate, average time (when timer added), streak
- [ ] **STA-03**: Word Guess stats page — total solves, win rate, guess distribution, streak, comparative ranking
- [ ] **STA-04**: Stats page accessible from each game's launch view
- [ ] **STA-05**: Stats persist per game in localStorage

### Comparative Rankings ("Better than X%")

- [ ] **CMP-01**: After solving a daily puzzle, show "You are better than X% of players" for applicable metrics
- [ ] **CMP-02**: Stats page shows per-metric comparative ranking (e.g., "Your streak is longer than 80% of players")
- [ ] **CMP-03**: Pre-computed distribution data bundled as static JSON (no server required)
- [ ] **CMP-04**: Always shows "You" — no named entries, no ranked list, no 1st/2nd/3rd

### Share Cards

- [ ] **SHR-01**: After solving a daily puzzle, player can share a visual result summary
- [ ] **SHR-02**: Word Guess share card uses colored emoji squares (Wordle-style pattern)
- [ ] **SHR-03**: Crossword share card shows mini filled/empty grid representation
- [ ] **SHR-04**: Share card does not reveal puzzle answers
- [ ] **SHR-05**: Copy-to-clipboard share option

### Crossword Engagement Hooks

- [ ] **ENH-01**: Crossword daily solve is recorded in streak/stats (integrates with engagement package)
- [ ] **ENH-02**: Crossword stats page is accessible from launch/play view
- [ ] **ENH-03**: Crossword stats show comparative ranking after daily solve

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Daily deal mode for solitaire | Random-only for this milestone; daily seeded solitaire deferred |
| Timer during play | Deferred — skip for v1.1 |
| Push notifications | Requires PWA/service worker infra; defer |
| Login / accounts / auth | Anonymous device ID + localStorage throughout |
| Multiplayer for these 3 games | Solo-only for v1.1 |
| Friends leaderboards | Deferred to future milestone |
| Additional games beyond these 3 | Focus on crossword, solitaire, word-guess only |
| Cross-game aggregate streaks/stats | Each game tracks independently; no combined summary |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SOL-01 | Phase 5 | Complete |
| SOL-02 | Phase 5 | Complete |
| SOL-03 | Phase 5 | Complete |
| SOL-04 | Phase 5 | Complete |
| SOL-05 | Phase 5 | Complete |
| SOL-06 | Phase 5 | Complete |
| SOL-07 | Phase 5 | Complete |
| SOL-08 | Phase 5 | Complete |
| SOL-09 | Phase 5 | Complete |
| WRD-01 | Phase 6 | Complete |
| WRD-02 | Phase 6 | Complete |
| WRD-03 | Phase 6 | Complete |
| WRD-04 | Phase 6 | Complete |
| WRD-05 | Phase 6 | Complete |
| WRD-06 | Phase 6 | Complete |
| WRD-07 | Phase 6 | Complete |
| WRD-08 | Phase 6 | Complete |
| ENG-01 | Phase 4 | Complete |
| ENG-02 | Phase 4 | Complete |
| ENG-03 | Phase 4 | Complete |
| ENG-04 | Phase 4 | Complete |
| ENG-05 | Phase 4 | Complete |
| STK-01 | Phase 7 | Pending |
| STK-02 | Phase 7 | Pending |
| STK-03 | Phase 7 | Pending |
| STK-04 | Phase 7 | Pending |
| STK-05 | Phase 7 | Pending |
| STA-01 | Phase 7 | Pending |
| STA-02 | Phase 7 | Pending |
| STA-03 | Phase 7 | Pending |
| STA-04 | Phase 7 | Pending |
| STA-05 | Phase 7 | Pending |
| CMP-01 | Phase 8 | Pending |
| CMP-02 | Phase 8 | Pending |
| CMP-03 | Phase 8 | Pending |
| CMP-04 | Phase 8 | Pending |
| SHR-01 | Phase 8 | Pending |
| SHR-02 | Phase 8 | Pending |
| SHR-03 | Phase 8 | Pending |
| SHR-04 | Phase 8 | Pending |
| SHR-05 | Phase 8 | Pending |
| ENH-01 | Phase 7 | Pending |
| ENH-02 | Phase 7 | Pending |
| ENH-03 | Phase 7 | Pending |

**Coverage:**

- v1.1 requirements: 44 total
- Mapped to phases: 44
- Unmapped: 0 ✅

---
*Requirements defined: 2026-07-01*
*Last updated: 2026-07-01 after initial definition*
