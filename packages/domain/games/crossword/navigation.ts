import type { CrosswordClue, CrosswordPuzzle } from "./types"

/**
 * The two NYT-style clue orientations. Pure-data marker; never imported by
 * React (this module stays framework-agnostic per the project invariant).
 */
export type CrosswordDirection = "across" | "down"

/**
 * The ordered list of cells a clue occupies. For an across clue the cells
 * walk the same row left-to-right; for a down clue the cells walk the same
 * column top-to-bottom. Length is always `clue.answer.length`.
 */
export function getClueCells(
  clue: CrosswordClue,
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []
  for (let i = 0; i < clue.answer.length; i++) {
    cells.push(
      clue.direction === "across"
        ? { row: clue.row, col: clue.col + i }
        : { row: clue.row + i, col: clue.col },
    )
  }
  return cells
}

/**
 * Returns the clue of `direction` whose span covers `cell`, or null when
 * no such clue exists. Across → same row and col ∈ [clue.col, clue.col+len);
 * down → same col and row ∈ [clue.row, clue.row+len).
 */
export function findClueAtCell(
  puzzle: CrosswordPuzzle,
  cell: { row: number; col: number },
  direction: CrosswordDirection,
): CrosswordClue | null {
  const clues = direction === "across" ? puzzle.across : puzzle.down
  for (const clue of clues) {
    const len = clue.answer.length
    if (direction === "across") {
      if (
        clue.row === cell.row &&
        cell.col >= clue.col &&
        cell.col < clue.col + len
      ) {
        return clue
      }
    } else {
      if (
        clue.col === cell.col &&
        cell.row >= clue.row &&
        cell.row < clue.row + len
      ) {
        return clue
      }
    }
  }
  return null
}

/**
 * GRID-01 safety net: never returns a direction with no word at the cell
 * when ANY word exists there. Returns `preferred` when a word exists in
 * that direction at `cell`; otherwise returns the other direction if one
 * exists there; otherwise returns `preferred` unchanged.
 *
 * This is the across-first-with-fallback rule (D-03): clicking a cell whose
 * preferred direction has no word auto-flips to the other direction instead
 * of landing on an empty context.
 */
export function resolveDirection(
  puzzle: CrosswordPuzzle,
  cell: { row: number; col: number },
  preferred: CrosswordDirection,
): CrosswordDirection {
  const other: CrosswordDirection =
    preferred === "across" ? "down" : "across"
  if (findClueAtCell(puzzle, cell, preferred) !== null) {
    return preferred
  }
  if (findClueAtCell(puzzle, cell, other) !== null) {
    return other
  }
  return preferred
}

/**
 * 0-based offset of `cell` within `clue`'s span, or -1 when the cell is
 * not part of the clue. Across uses the column delta, down uses the row
 * delta — both from the clue's start cell.
 */
export function cellIndexInClue(
  clue: CrosswordClue,
  cell: { row: number; col: number },
): number {
  const len = clue.answer.length
  if (clue.direction === "across") {
    if (clue.row !== cell.row) return -1
    const idx = cell.col - clue.col
    return idx >= 0 && idx < len ? idx : -1
  }
  if (clue.col !== cell.col) return -1
  const idx = cell.row - clue.row
  return idx >= 0 && idx < len ? idx : -1
}

/**
 * Immediate next cell along the clue's axis, or null at the last cell
 * (D-06 stop-at-word-end — auto-advance never wraps to the next word).
 */
export function nextCellInWord(
  clue: CrosswordClue,
  cell: { row: number; col: number },
): { row: number; col: number } | null {
  const idx = cellIndexInClue(clue, cell)
  if (idx === -1 || idx >= clue.answer.length - 1) return null
  return clue.direction === "across"
    ? { row: clue.row, col: clue.col + idx + 1 }
    : { row: clue.row + idx + 1, col: clue.col }
}

/**
 * Immediate previous cell along the clue's axis, or null at the first cell
 * (D-12 boundary — backspace step-back never wraps to the previous word).
 */
export function previousCellInWord(
  clue: CrosswordClue,
  cell: { row: number; col: number },
): { row: number; col: number } | null {
  const idx = cellIndexInClue(clue, cell)
  if (idx <= 0) return null
  return clue.direction === "across"
    ? { row: clue.row, col: clue.col + idx - 1 }
    : { row: clue.row + idx - 1, col: clue.col }
}

/**
 * Next clue in the same direction by ascending `number`, WRAPPING from the
 * last clue back to the first. `currentNumber === undefined` returns the
 * first clue (used when the player has no current clue yet).
 */
export function nextClueInDirection(
  puzzle: CrosswordPuzzle,
  direction: CrosswordDirection,
  currentNumber: number | undefined,
): CrosswordClue {
  const clues = direction === "across" ? puzzle.across : puzzle.down
  if (clues.length === 0) {
    throw new Error(
      `nextClueInDirection: no clues in ${direction} direction`,
    )
  }
  if (currentNumber === undefined) {
    return clues[0]
  }
  const idx = clues.findIndex((c) => c.number === currentNumber)
  if (idx === -1) {
    // Number not found (stale or foreign): default to first.
    return clues[0]
  }
  return clues[(idx + 1) % clues.length]
}

/**
 * Previous clue in the same direction by descending `number`, WRAPPING
 * from the first clue back to the last. `currentNumber === undefined`
 * returns the last clue.
 */
export function previousClueInDirection(
  puzzle: CrosswordPuzzle,
  direction: CrosswordDirection,
  currentNumber: number | undefined,
): CrosswordClue {
  const clues = direction === "across" ? puzzle.across : puzzle.down
  if (clues.length === 0) {
    throw new Error(
      `previousClueInDirection: no clues in ${direction} direction`,
    )
  }
  if (currentNumber === undefined) {
    return clues[clues.length - 1]
  }
  const idx = clues.findIndex((c) => c.number === currentNumber)
  if (idx === -1) {
    return clues[clues.length - 1]
  }
  return clues[(idx - 1 + clues.length) % clues.length]
}
