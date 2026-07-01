# Phase 5: Solitaire Klondike — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-02
**Phase:** 5-solitaire-klondike
**Areas discussed:** Draw mode, Partial draw-3, Win celebration, Seed selection, Default draw mode, Waste pile display, State migration

---

## Draw Mode

| Option | Description | Selected |
|--------|-------------|----------|
| In-play settings toggle | Draw mode toggle alongside auto-stack in the play settings widget | |
| **Split into two modes in launch picker** | Replace "Klondike" with "Klondike Draw 1" and "Klondike Draw 3" in the mode selector on the landing view | ✓ |

**User's choice:** Split Klondike into two modes in the launch picker
**Notes:** Draw mode is a launch-time choice, not a play-time setting. The mode is set before the game starts and persists with the game state.

## Partial Draw-3

| Option | Description | Selected |
|--------|-------------|----------|
| **Standard convention** | When stock has fewer than 3 cards, draw the remaining 1-2 cards | ✓ |
| Skip partial | Only draw when 3 full cards are available | |

**User's choice:** Follow standard Klondike convention (draw remaining cards)

## Win Celebration

| Option | Description | Selected |
|--------|-------------|----------|
| **Text-only (first pass)** | Current "You won!" muted text is fine for v1.1 — Phase 7 adds proper celebration | ✓ |
| Full overlay/modal | Build a win celebration overlay now | |

**User's choice:** Text-only is fine for now

## Seed / Randomness

| Option | Description | Selected |
|--------|-------------|----------|
| **Pure random deal** | Existing `Math.random` behavior, no seed input | ✓ |
| Seed input option | Show a seed input on the launch view | |

**User's choice:** Pure random deal, no seed input

## Default Draw Mode

| Option | Description | Selected |
|--------|-------------|----------|
| **Klondike Draw 1** | Default selected mode in the picker when no mode is chosen | ✓ |
| Klondike Draw 3 | Default to draw-3 | |

**User's choice:** Klondike Draw 1 is the default

## Waste Pile Display (Draw-3)

| Option | Description | Selected |
|--------|-------------|----------|
| **Fanned/offset pile** | Visually show up to 3 offset cards in the waste pile for draw-3 mode | ✓ |
| Single card (as now) | Show only the top card regardless of draw count | |

**User's choice:** Fanned/offset waste pile showing up to 3 cards

## State Migration

| Option | Description | Selected |
|--------|-------------|----------|
| **Clear outdated saved state** | If saved state lacks `drawCount`, clear it and start fresh | ✓ |
| Default to draw-1 gracefully | Assume draw-1 for any state without drawCount | |

**User's choice:** Clear outdated saved state and start fresh

---

## Deferred Ideas

None — discussion stayed within phase scope.

