# Phase 5: Solitaire Klondike — Context

**Gathered:** 2026-07-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Klondike solitaire game with two draw-variant modes (Draw 1 and Draw 3), drag-and-drop and click-based interaction, double-click auto-foundation, win detection, auto-stack, and local persistence. Builds on existing domain code and UI shell already present in the codebase.

**Major gaps to close:**
- Split Klondike into two modes (Draw 1 / Draw 3) in the mode picker
- Implement draw-3 in the domain (pop N cards based on drawCount)
- Display draw-3 waste pile as fanned/offset pile
- Wire mode selection to draw count throughout the game lifecycle

**Out of scope:** Pyramid, TriPeaks, FreeCell (other SolitaireMode values — deferred). Win celebration enhancements (deferred to Phase 7). Timer (deferred from v1.1). Daily solitaire mode (deferred from v1.1).

</domain>

<decisions>
## Implementation Decisions

### Draw Mode — Modes Split
- **D-01:** `SOLITAIRE_MODES` removes standalone `"klondike"` and adds `"klondike-draw1"` and `"klondike-draw3"` as separate entries. The launch view mode picker shows both as distinct options.
- **D-02:** Default selected mode in the picker is `"klondike-draw1"`.
- **D-03:** `SOLITAIRE_MODE_INFO` updated with labels "Klondike Draw 1" and "Klondike Draw 3" and appropriate taglines.
- **D-04:** Both modes render the same `KlondikePlaySection` / `KlondikeBoard` — the only difference is the draw count passed to the game hook.

### Draw Count — State & Domain
- **D-05:** `KlondikeState` gains `drawCount: 1 | 3` field, set at deal time based on the selected mode.
- **D-06:** `createKlondikeGame` / `dealKlondikeState` accept a `drawCount` option (default 1).
- **D-07:** The `draw` move action reads `state.drawCount` and pops up to that many cards from stock to waste. If stock has fewer than `drawCount`, the remaining cards are drawn (standard partial draw).
- **D-08:** The `recycle` move action is unaffected — all waste cards return to stock face-down regardless of draw count.

### Waste Pile Display
- **D-09:** Draw-3 waste pile shows a fanned/offset stack so visually up to 3 cards are visible (only the top card is interactable, which follows standard Klondike convention).
- **D-10:** Draw-1 waste pile continues to display a single card.

### State Persistence & Migration
- **D-11:** `useKlondikeGame` stores the full `KlondikeState` (including `drawCount`) under `solitaire:klondike:session`.
- **D-12:** On load, if the saved state is missing `drawCount` (pre-v1.1 state), the saved game is **cleared** and a fresh game is started. This prevents mixing game state modes.

### Win Celebration
- **D-13:** Win detection works correctly (all 52 cards on foundation → `status: "won"`). Visual feedback remains text-only (`"You won!"` string) for v1.1. Phase 7 will add proper celebration UI.

### Seed / Randomness
- **D-14:** Endless random deals use `Math.random` (no seed). No seed input is shown to the player. The seed field in `KlondikeState` remains `null` for random deals (as it currently is).

### Claude's Discretion
- How the fanned offset waste pile is implemented (CSS vs canvas vs stacking cards with transform/position)
- Exact visual offset values for draw-3 waste fan
- Whether `applyKlondikeMove.draw` iterates per-card or bulk-moves N cards (bulk preferred for consistency)
- Update the board min-height calculation for draw-3 waste visibility
- Testing approach: existing domain tests extend to cover draw-3 behavior
- `formatSolitaireModeLabel` — currently maps from SOLITAIRE_MODE_INFO which already has per-mode labels

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & Requirements
- `.planning/ROADMAP.md` §"Phase 5: Solitaire Klondike" — goal, success criteria, requirement IDs (SOL-01 through SOL-09)
- `.planning/REQUIREMENTS.md` — full requirement definitions for SOL-01 through SOL-09
- `.planning/STATE.md` — current milestone state

### Domain — Solitaire Klondike
- `packages/domain/games/solitaire/klondike/types.ts` — `KlondikeState`, `KlondikeMove`, `KlondikeMoveResult` (add `drawCount`)
- `packages/domain/games/solitaire/klondike/game.ts` — `createKlondikeGame`, `applyKlondikeMove` (modify draw logic, accept drawCount)
- `packages/domain/games/solitaire/klondike/deal.ts` — `dealKlondikeState` (accept drawCount param)
- `packages/domain/games/solitaire/klondike/deck.ts` — `shuffleKlondikeDeck`, `createKlondikeDeck`
- `packages/domain/games/solitaire/klondike/rules.ts` — `canPlaceOnFoundation`, `canPlaceOnTableau`, `canStackOnTableau` (no changes needed)
- `packages/domain/games/solitaire/klondike/game.test.ts` — existing test coverage (extend for draw-3)
- `packages/domain/games/solitaire/klondike/index.ts` — re-export any new symbols
- `packages/domain/games/solitaire/modes.ts` — `SOLITAIRE_MODES`, `SOLITAIRE_MODE_INFO` (split Klondike into two modes)
- `packages/domain/games/solitaire/index.ts` — package re-exports

### Web UI
- `apps/web/src/features/games/solitaire/components/solitaire-play-view.tsx` — `isBoardLayout` check (update for new mode values), pass drawCount
- `apps/web/src/features/games/solitaire/components/solitaire-settings-widget.tsx` — mode picker in launch view (no component change needed, mode values auto-reflect)
- `apps/web/src/features/games/solitaire/components/klondike-board.tsx` — stock/waste area (draw-3 fanned waste pile)
- `apps/web/src/features/games/solitaire/components/playing-card.tsx` — card rendering (confirm waste fan support)
- `apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts` — accept drawCount param, pass to `createKlondikeGame`, add migration detection
- `apps/web/src/features/games/solitaire/hooks/use-klondike-drag.ts` — drag from waste (confirm it works with fanned pile)
- `apps/web/src/features/games/solitaire/context/solitaire-play-preferences-context.tsx` — no change needed (draw mode not a play-time setting)
- `apps/web/src/features/games/solitaire/solitaire-play-preferences.ts` — no change needed

### Existing Engagement (Phase 4)
- `.planning/phases/04-engagement-foundation/04-CONTEXT.md` — engagement types, completion recording patterns (used in Phase 7, not Phase 5)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Full Klondike domain** (`packages/domain/games/solitaire/klondike/`) — complete deck, deal, rules, game logic, auto-foundation, auto-stack, win detection — all pure TS with 60+ tests
- **KlondikeBoard** — complete interactive board component with stock/waste/foundation/tableau rendering, drag-and-drop, auto-stack fly animation, selection state
- **useKlondikeGame hook** — full game state management with localStorage persistence, selection, move validation, auto-stack queue
- **useKlondikeDrag** — drag-and-drop interaction via `useKlondikeDrag` hook
- **useKlondikeFoundationFly** — animated auto-foundation card fly
- **SolitairePlaySettingsWidget** — in-play settings for card skin and auto-stack toggle
- **PlayingCard component** — renders individual cards with variants and face-up/down
- **CardSlot** — empty slot placeholder for waste/foundation/tableau

### Established Patterns
- **Pure-function domain** — no side effects, no React, no I/O in `packages/domain/`
- **Mode → URL param → routing** — mode selection drives `solitairePlayPath(mode)` and `useQueryState("mode", ...)`
- **Storage key convention** — `<game>:<variant>:<key>`
- **No default exports** — named exports everywhere
- **Discriminated union results** — `KlondikeMoveResult` follows `{ ok: true, state } | { ok: false, reason }` pattern

### Integration Points
- `packages/domain/games/solitaire/modes.ts` — add new mode values (central source of truth for mode picker, paths, and routing)
- `apps/web/src/features/games/solitaire/components/solitaire-play-view.tsx` — `isBoardLayout` check needs to match both `"klondike-draw1"` and `"klondike-draw3"`
- `apps/web/src/features/games/solitaire/hooks/use-klondike-game.ts` — entry point for draw count injection
- `packages/domain/games/solitaire/index.ts` — re-exports for new/updated symbols

</code_context>

<specifics>
## Specific Ideas

- Draw mode is a **launch-time choice**, not an in-play setting. The player picks "Klondike Draw 1" or "Klondike Draw 3" from the mode picker on the landing view before playing. This follows the convention of choosing a game mode upfront, similar to crossword size selection.
- Draw-3 waste pile should visually show 3 fanned/offset cards so the player can see the count at a glance (like standard solitaire apps).
- The game state carries `drawCount` so switching modes naturally starts a fresh game (old state cleared on mismatch — but since each mode is a separate mode value, the saved state key is the same (`solitaire:klondike:session`) and clearing based on missing `drawCount` handles migration).

</specifics>

<deferred>
## Deferred Ideas

- **Pyramid / TriPeaks / FreeCell modes** — listed in `SOLITAIRE_MODES` but not implemented. The "coming soon" placeholder remains for these.
- **Win celebration UI** — deferred to Phase 7 (stats pages, streak display).
- **Timer during play** — deferred from v1.1 milestone.
- **Daily solitaire mode** — deferred from v1.1 milestone. Solitaire remains random-only.
- **Seed input for solitaire** — not needed for v1.1.

</deferred>

---

*Phase: 5-solitaire-klondike*
*Context gathered: 2026-07-02*
