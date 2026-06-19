---
phase: 01-end-to-end-playable-puzzle
plan: "02"
subsystem: crossword/win-detection
tags: [crossword, win-detection, hooks]
dependency_graph:
  requires: []
  provides: [WIN-01]
  affects: [use-crossword-game.ts]
tech_stack:
  added: []
  patterns: [functional-updater, atomic-state-recompute]
key_files:
  created:
    - apps/web/src/features/games/crossword/hooks/use-crossword-game.ts
  modified:
    - packages/domain/daily/seed.ts
    - packages/domain/daily/index.ts
decisions:
  - "D-04: Win detection wired atomically inside setGameState updater using newInputs (not a separate effect)"
  - "D-05: recheckStatus/autoCheck left untouched — serves error highlighting only"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-19"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 3
---

# Phase 1 Plan 02: Wire Win Detection into updateInput Summary

**One-liner:** Atomic inline `resolveCrosswordStatus` call in `updateInput` closes the win-detection loop on every keystroke.

## What Was Built

Added `status: resolveCrosswordStatus(prev.puzzle, newInputs, prev.status)` to the `setGameState` return in `updateInput`. Status recomputes on every input using freshly computed `newInputs`, so a correct complete solution flips status to `"won"` on the same keystroke that fills the last cell.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Recompute status inside updateInput | ea8f5ba | apps/web/src/features/games/crossword/hooks/use-crossword-game.ts |

## Deviations from Plan

**1. [Rule 3 - Blocking] Missing `hashSeed` export in daily package**
- Found during: Task 1 tsc verification
- Issue: worktree started from `main` where `hashSeed` was not yet exported; crossword generator imports it
- Fix: copied `hashSeed` implementation from develop's working directory
- Files: `packages/domain/daily/seed.ts`, `packages/domain/daily/index.ts`
- Commit: ea8f5ba

## Self-Check: PASSED
