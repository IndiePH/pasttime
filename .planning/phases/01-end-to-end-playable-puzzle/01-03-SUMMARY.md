---
phase: 01-end-to-end-playable-puzzle
plan: "03"
subsystem: crossword-ui
tags: [focus, keyboard, ux, crossword]
dependency_graph:
  requires: []
  provides: [cell-dom-focus-on-click]
  affects: [crossword-grid]
tech_stack:
  added: []
  patterns: [react-synthetic-event-currentTarget-focus]
key_files:
  created: []
  modified:
    - apps/web/src/features/games/crossword/components/crossword-grid.tsx
decisions:
  - "Used e.currentTarget.focus() in onClick rather than a ref/useEffect — tabIndex={0} already present, no new plumbing needed (D-07)"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-19"
requirements: [PLAY-01]
---

# Phase 01 Plan 03: Wire DOM Focus on Cell Click Summary

Single-line: Added `(e.currentTarget as HTMLElement).focus()` in the crossword cell `onClick` handler so the first click both selects the cell and gives it keyboard focus, making typing work immediately.

## What Was Built

Changed the `crossword-grid.tsx` cell `onClick` from:
```tsx
onClick={() => !isBlock && onCellClick(row, col)}
```
to:
```tsx
onClick={(e) => { if (!isBlock) { (e.currentTarget as HTMLElement).focus(); onCellClick(row, col) } }}
```

No ref, no useEffect — `tabIndex={0}` was already on every non-block cell, so `.focus()` works directly via `currentTarget`.

## Verification

- `grep` confirms `currentTarget as HTMLElement).focus()` present in file
- `npx tsc --noEmit` passes with no errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network surface, auth paths, or schema changes.

## Self-Check: PASSED

- File exists: `apps/web/src/features/games/crossword/components/crossword-grid.tsx` — confirmed created
- Commit `9fd7cdb` exists in git log — confirmed
