---
phase: 01-end-to-end-playable-puzzle
plan: "01"
subsystem: crossword/corpus-generator
tags: [crossword, corpus, generator, data]
dependency_graph:
  requires: []
  provides: [DATA-01, GEN-01, GEN-02, GEN-03, GEN-04]
  affects: [corpus.json, generator.ts]
tech_stack:
  added: [build-corpus.mjs]
  patterns: [corpus-build-script, json-pool]
key_files:
  created:
    - packages/domain/games/crossword/corpus.json
    - packages/domain/games/crossword/scripts/build-corpus.mjs
  modified:
    - packages/domain/games/crossword/generator.ts
decisions:
  - "D-01: Merged all four corpus files (clues.json, clues.generated.json, clues.cache.json, crossword-definitions.json) — deduplicated by answer"
  - "D-03: Filtered to 3-10 chars, letters-only, non-empty clue"
  - "D-06: Generator failure fallback = best-effort partial puzzle, no throw"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-19"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
  corpus_entries: 629
---

# Phase 1 Plan 01: Build Corpus and Wire Generator Summary

**One-liner:** Merged 4 corpus files into 629-entry deduplicated corpus.json and wired generator POOL to import it directly.

## What Was Built

**Task 1:** `build-corpus.mjs` script merges `clues.json`, `clues.generated.json`, `clues.cache.json`, and `crossword-definitions.json` into a single `corpus.json`. Deduplicates by answer (uppercased), filters to 3–10 chars letters-only with non-empty clue. Produces 629 entries. Added `build:corpus` npm script to `packages/domain/package.json`.

**Task 2:** `generator.ts` now imports `corpusData from "./corpus.json"` and builds `POOL` directly from it, replacing the old hardcoded `clues.json` import. Word pool expanded from ~100 to 629 entries, enabling real interlocking crossword grids.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build corpus script and generate corpus.json | b5f586c | packages/domain/games/crossword/scripts/build-corpus.mjs, corpus.json, package.json |
| 2 | Wire generator POOL to corpus.json | 613c81e | packages/domain/games/crossword/generator.ts |

## Deviations from Plan

None.

## Self-Check: PASSED
