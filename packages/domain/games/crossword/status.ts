import { getCellKey } from "./types"
import type { CrosswordPuzzle, CrosswordStatus } from "./types"

/**
 * True when every playable (letter) cell has a non-empty input. Used to gate
 * win detection — the puzzle is only "won" once the grid is complete.
 */
export function isCrosswordComplete(
  puzzle: CrosswordPuzzle,
  inputs: Record<string, string>,
): boolean {
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (cell.type !== "letter") {
        continue
      }
      const value = inputs[getCellKey(cell.row, cell.col)]
      if (!value) {
        return false
      }
    }
  }
  return true
}

/**
 * True when every filled input matches the cell's answer letter. Empty cells
 * are ignored so this doubles as a partial-correctness check for the "show
 * errors" toggle.
 */
export function isCrosswordSolved(
  puzzle: CrosswordPuzzle,
  inputs: Record<string, string>,
): boolean {
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (cell.type !== "letter") {
        continue
      }
      const value = inputs[getCellKey(cell.row, cell.col)]
      if (!value) {
        return false
      }
      if (value.toUpperCase() !== cell.answerLetter) {
        return false
      }
    }
  }
  return true
}

/**
 * Derive the round status from inputs and the current status. A round becomes
 * "won" only once the grid is complete and correct; it never auto-loses.
 */
export function resolveCrosswordStatus(
  puzzle: CrosswordPuzzle,
  inputs: Record<string, string>,
  current: CrosswordStatus,
): CrosswordStatus {
  if (current === "abandoned") {
    return current
  }
  if (isCrosswordSolved(puzzle, inputs)) {
    return "won"
  }
  return "playing"
}
