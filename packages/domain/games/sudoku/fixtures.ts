import type { SudokuGrid } from "./types"

/**
 * Fixtures for the technique rater (`rate.test.ts`).
 * All frozen puzzles below are derived from the same valid full solution:
 *
 * 534678912
 * 672195348
 * 198342567
 * 859761423
 * 426853791
 * 713924856
 * 961537284
 * 287419635
 * 345286179
 *
 * Cells were removed while confirming (via the rater itself, offline) that the
 * remaining puzzle stays uniquely solvable through the human-technique ladder
 * at the intended ceiling — no guessing/backtracking involved.
 */

/** Solvable end-to-end using only naked/hidden singles. */
export const EASY_SINGLES_ONLY_GIVENS: SudokuGrid = [
  0, 3, 4, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 0, 0, 0, 7, 0,
  0, 0, 0, 0, 0, 2, 0, 0, 5, 0, 7, 0, 1, 0, 1, 0,
  0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 7, 2, 8, 0, 2,
  8, 0, 4, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 6, 0, 0,
  9,
]

/** Singles alone stall; a naked pair is required to make further progress. */
export const MEDIUM_NAKED_PAIR_GIVENS: SudokuGrid = [
  5, 0, 0, 0, 0, 0, 0, 0, 2, 0, 7, 0, 0, 0, 5, 3,
  0, 0, 0, 9, 0, 0, 0, 0, 0, 6, 0, 0, 0, 9, 0, 6,
  0, 0, 2, 3, 4, 0, 6, 8, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 2, 4, 0, 0, 0, 0, 6, 0, 5, 0, 0, 0, 8, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 8, 0, 0, 7,
  9,
]

/** Needs a naked triple beyond pairs/locked-candidates — rates as hard. */
export const HARD_NAKED_TRIPLE_GIVENS: SudokuGrid = [
  5, 0, 4, 0, 0, 8, 9, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 9, 8, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 6,
  1, 0, 0, 0, 0, 0, 6, 8, 0, 3, 7, 9, 0, 7, 0, 0,
  0, 0, 0, 8, 5, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 2,
  0, 0, 4, 0, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 7,
  0,
]

/** Stalls beyond the ladder (would need backtracking/X-Wing+) — unrated. */
export const UNRATED_NEEDS_BACKTRACKING_GIVENS: SudokuGrid = [
  0, 0, 0, 6, 7, 0, 0, 0, 0, 6, 0, 0, 1, 0, 5, 3,
  4, 0, 1, 9, 8, 3, 0, 0, 5, 6, 0, 0, 5, 0, 7, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0,
  9, 2, 0, 0, 0, 6, 0, 6, 1, 0, 0, 0, 2, 0, 0, 0,
  8, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 8, 0, 1, 0,
  0,
]

/** All-zero board — nothing to reason from; no forced placements exist. */
export const EMPTY_GIVENS: SudokuGrid = new Array(81).fill(0)

/** Full solved grid with a duplicated digit in row 0 — structurally invalid. */
export const INVALID_DUPLICATE_GIVENS: SudokuGrid = [
  5, 5, 4, 6, 7, 8, 9, 1, 2, 6, 7, 2, 1, 9, 5, 3,
  4, 8, 1, 9, 8, 3, 4, 2, 5, 6, 7, 8, 5, 9, 7, 6,
  1, 4, 2, 3, 4, 2, 6, 8, 5, 3, 7, 9, 1, 7, 1, 3,
  9, 2, 4, 8, 5, 6, 9, 6, 1, 5, 3, 7, 2, 8, 4, 2,
  8, 7, 4, 1, 9, 6, 3, 5, 3, 4, 5, 2, 8, 6, 1, 7,
  9,
]
