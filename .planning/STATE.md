---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Three Games + Engagement
current_phase: 6
current_phase_name: Word Guess
status: completed
stopped_at: Phase 5 complete — all 2 plans executed
last_updated: "2026-07-02T07:30:07.066Z"
last_activity: 2026-07-02
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 5
  completed_plans: 5
  percent: 40
---

# STATE: Pasttime — Three Games + Engagement

**Milestone:** Three Games + Engagement — 🚧 v1.1 PLANNING
**Started:** 2026-07-01

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-01)

**Core Value:** A player can open any of 3 games (crossword, solitaire, word guess), play a satisfying round, see their per-game streaks and stats, and know how they compare to the playerbase — all without logging in.

**Current Focus:** Phase 5 — solitaire-klondike

---

## Current Position

| Item | Value |
|------|-------|
| Phase | 6 — Word Guess |
| Plan | Not started |
| Status | Complete |
| Last activity | 2026-07-02 |

## Milestone Overview

| Metric | Value |
|--------|-------|
| Phases total | 5 (Phases 4–8) |
| Phases complete | 1 (Phase 4) |
| Requirements total | 44 |
| Requirements mapped | 44 |
| Requirements complete | 5 (ENG-01—ENG-05) |

---

## Phase Structure

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 4 — Engagement Foundation | Shared domain package for per-game streaks and stats | 5 (ENG-01—ENG-05) | ✅ Complete |
| 5 — Solitaire Klondike | Complete playable Klondike with draw-1/draw-3 modes | 9 (SOL-01—SOL-09) | ✅ Complete |
| 6 — Word Guess | Word-guessing game with all modes | 8 (WRD-01—WRD-08) | Not started |
| 7 — Streaks, Stats & Crossword Engagement | Per-game streaks, stats pages, crossword wiring | 13 (STK-01—STK-05, STA-01—STA-05, ENH-01—ENH-03) | Not started |
| 8 — Rankings & Share Cards | Comparative rankings and share cards | 9 (CMP-01—CMP-04, SHR-01—SHR-05) | Not started |

---

## Key Decisions (v1.1)

| Decision | Rationale | Status |
|----------|-----------|--------|
| Engagement foundation first (Phase 4) | All streaks/stats/rankings depend on shared types and computation | ✓ Adopted |
| Solitaire + Word Guess in parallel (Phases 5, 6) | Games are independent; domain code already exists for both | ✓ Adopted |
| Streaks/stats/crossword engagement grouped (Phase 7) | All wire engagement data into UI across games; natural delivery | ✓ Adopted |
| Rankings + share cards combined (Phase 8) | Both post-solve features; share cards depend on games being playable | ✓ Adopted |
| No timer in v1.1 | Deferred — reduces scope; timer not needed for core engagement loop | ✓ Confirmed |
| No daily solitaire mode | Deferred — solitaire random-only for v1.1; streaks infrastructure wired but inactive | ✓ Confirmed |
| Client-side only for comparative rankings | Pre-computed distribution JSON bundled; no server needed, no login | ✓ Adopted |
| No cross-game aggregate streaks | Each game tracks independently; combined summary deferred | ✓ Confirmed |
| **New — Phase 5:** Klondike split into two launch modes (Draw 1 / Draw 3) | Draw mode is a launch-time choice, not a play-time setting | ✓ Adopted |
| **New — Phase 5:** Standard partial draw-3 | Draw remaining cards when stock < 3 | ✓ Adopted |
| **New — Phase 5:** Fanned waste pile for draw-3 | Visually show up to 3 offset cards | ✓ Adopted |
| **New — Phase 5:** Clear outdated saved states | Missing `drawCount` = start fresh | ✓ Adopted |

---

## Deferred Items

| Category | Item | Status |
|----------|------|--------|
| scope | Timer during play | Deferred from v1.1 |
| scope | Daily solitaire mode | Deferred from v1.1 |
| scope | Push notifications | Deferred (needs PWA infra) |
| scope | Cross-game aggregate stats | Deferred |
| scope | Friends / leaderboards | Deferred to future milestone |
| scope | Additional games | Deferred |

---

## Session Continuity

**Resume file:** .planning/phases/05-solitaire-klondike/05-01-PLAN.md

**Last session:** 2026-07-02T07:23:20.695Z
**Current session:** 2026-07-02
**Stopped at:** Phase 5 complete — all 2 plans executed
**Next action:** Phase 6 is actionable. Move to word-guess implementation.

---

## Performance Metrics (v1.0 Baseline)

| Metric | v1.0 Value |
|--------|------------|
| Phases total | 3 |
| Requirements mapped | 20/20 |
| Timeline | 2026-06-19 → 2026-06-29 (10 days) |
| Crossword commits | ~48 |

---

## Decisions

### Phase 4 — Engagement Foundation

- **Plan 03:** `computeStats` returns empty StatsSnapshot ({}) for empty completions — safe default, consumers check existence
- **Plan 03:** `winRate` rounded to 3 decimal places (0.750 style) — consistent across games
- **Plan 03:** `averageTime: null` when no time data — distinguishes "not applicable" from "not yet collected"
- **Plan 03:** Solitaire moves fields undefined when no moves data — consumer uses `??` fallback
- **Plan 03:** `computePercentile` returns 50 for empty distribution — neutral position, no data shouldn't imply top/bottom
- **Plan 03:** DISTRIBUTION_DATA uses stub values — replaced with real data in future update
- **Plan 02:** `computeStreak` implemented as pure function — no side effects, no I/O — caller passes pre-loaded completions
- **Plan 02:** `areConsecutiveDays` uses `getDailySeed` after adding 1 UTC day — handles year/month boundaries correctly
- **Plan 02:** Current streak requires most recent completion to be today or yesterday (UTC) — broken if older
- **Phase 4:** Engagement package exported from `@pasttime/domain/engagement` — pure domain, no React/IO — follows existing domain package convention
- **Phase 4:** Package scaffolding at packages/domain/engagement/ with types, persistence helpers, and subpath export — follows existing domain package convention

### Phase 5 — Solitaire Klondike

- `SOLITAIRE_MODES` replaces `"klondike"` with `"klondike-draw1"` and `"klondike-draw3"`
- Default mode is `"klondike-draw1"`
- `KlondikeState` gains `drawCount: 1 | 3`, set at deal time
- Draw action reads `drawCount` from state; standard partial draw for draw-3
- Draw-3 waste pile displayed as fanned/offset stack (up to 3 cards visible)
- Outdated saved states (missing `drawCount`) are cleared — fresh game starts
- Win celebration remains text-only for v1.1; Phase 7 adds proper celebration
- Pure random deals (Math.random), no seed input
- `useKlondikeGame(drawCount)` accepts draw count parameter and validates persisted state (Plan 02)
- `isKlondikeState` enhanced to check `drawCount` field and optionally match expected (Plan 02)
- Draw action produces screen-reader-friendly feedback: 'Drew 1 card' / 'Drew N cards' (Plan 02)
- Waste fan step uses `calc(var(--game-card-w) * 0.15)` for proportional scaling (Plan 02)
