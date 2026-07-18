import { hashSeed } from "../../daily"
import { boxIndex, indexToRowCol, peerIndexes } from "./board"
import { createSudokuRng, type SudokuRng } from "./rng"
import { rateSudoku, type SudokuRating } from "./rate"
import { SUDOKU_DIFFICULTY_RANK as DIFFICULTY_RANK, type SudokuDifficulty } from "./settings"
import type { SudokuCell, SudokuGrid, SudokuPuzzle } from "./types"

export const SUDOKU_GENERATE_MAX_ATTEMPTS = 50

/** Seed mixing stride between generation attempts (arbitrary large prime). */
const ATTEMPT_SEED_STRIDE = 9973

export interface GenerateSudokuOptions {
  difficulty: SudokuDifficulty
  seed: number
  maxAttempts?: number
}

interface CarveResult {
  givens: SudokuGrid
  rating: SudokuRating
}

/**
 * Backtracking fill: places digits 1–9 into an empty grid using a shuffled
 * digit order at every cell, producing a randomized-but-valid complete
 * solution. Sudoku grids are always fillable this way, so this never fails.
 */
export function fillGrid(rng: SudokuRng): SudokuGrid {
  const grid: SudokuGrid = new Array(81).fill(0)
  fillFrom(grid, 0, rng)
  return grid
}

function fillFrom(grid: SudokuGrid, position: number, rng: SudokuRng): boolean {
  if (position === 81) return true
  const digits = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const digit of digits) {
    if (isSafePlacement(grid, position, digit)) {
      grid[position] = digit
      if (fillFrom(grid, position + 1, rng)) return true
      grid[position] = 0
    }
  }
  return false
}

function isSafePlacement(grid: SudokuGrid, index: number, digit: number): boolean {
  for (const peer of peerIndexes(index)) {
    if (grid[peer] === digit) return false
  }
  return true
}

/**
 * Counts distinct solutions of `givens` via bitmask backtracking with a
 * minimum-remaining-candidates heuristic, aborting as soon as `limit`
 * solutions are found. Used to confirm a carved puzzle stays uniquely
 * solvable without needing to enumerate every solution.
 */
export function countSolutions(givens: SudokuGrid, limit = 2): number {
  const values = givens.slice()
  const rows = new Array(9).fill(0)
  const cols = new Array(9).fill(0)
  const boxes = new Array(9).fill(0)

  for (let i = 0; i < 81; i++) {
    const v = values[i]
    if (v === 0) continue
    const { row, col } = indexToRowCol(i)
    const box = boxIndex(row, col)
    const bit = 1 << (v - 1)
    rows[row] |= bit
    cols[col] |= bit
    boxes[box] |= bit
  }

  let count = 0

  function candidateMask(index: number): number {
    const { row, col } = indexToRowCol(index)
    const box = boxIndex(row, col)
    return 0x1ff & ~(rows[row] | cols[col] | boxes[box])
  }

  function solve(): boolean {
    let best = -1
    let bestMask = 0
    let bestCount = 10
    for (let i = 0; i < 81; i++) {
      if (values[i] !== 0) continue
      const mask = candidateMask(i)
      let c = 0
      for (let d = 0; d < 9; d++) if (mask & (1 << d)) c++
      if (c === 0) return false
      if (c < bestCount) {
        bestCount = c
        best = i
        bestMask = mask
        if (c === 1) break
      }
    }
    if (best === -1) {
      count++
      return count >= limit
    }
    const { row, col } = indexToRowCol(best)
    const box = boxIndex(row, col)
    for (let digit = 1; digit <= 9; digit++) {
      const bit = 1 << (digit - 1)
      if (!(bestMask & bit)) continue
      values[best] = digit
      rows[row] |= bit
      cols[col] |= bit
      boxes[box] |= bit
      const stop = solve()
      values[best] = 0
      rows[row] &= ~bit
      cols[col] &= ~bit
      boxes[box] &= ~bit
      if (stop) return true
    }
    return false
  }

  solve()
  return count
}

/**
 * Removes clues from a complete solution in shuffled order, keeping each
 * removal only when the puzzle stays uniquely solvable and the resulting
 * technique rating does not exceed the target difficulty's ceiling. Clue
 * removals that would push the rating above the ceiling (or make it
 * unrated) are reverted individually — the pass continues over the rest of
 * the shuffled order rather than abandoning the whole attempt.
 */
export function carve(solution: SudokuGrid, rng: SudokuRng, difficulty: SudokuDifficulty): CarveResult {
  const targetRank = DIFFICULTY_RANK[difficulty]
  const givens = solution.slice()
  const order = rng.shuffle(Array.from({ length: 81 }, (_, i) => i))
  let rating = rateSudoku(givens)

  for (const index of order) {
    const removedValue = givens[index]
    if (removedValue === 0) continue

    givens[index] = 0
    if (countSolutions(givens, 2) !== 1) {
      givens[index] = removedValue
      continue
    }

    const candidateRating = rateSudoku(givens)
    if (candidateRating.difficulty === "unrated" || DIFFICULTY_RANK[candidateRating.difficulty] > targetRank) {
      givens[index] = removedValue
      continue
    }

    rating = candidateRating
  }

  return { givens, rating }
}

/** Builds cells for a fresh puzzle: givens become immutable, pre-filled cells. */
export function createGameCellsFromPuzzle(puzzle: SudokuPuzzle): SudokuCell[] {
  return puzzle.givens.map((value) => ({
    given: value !== 0,
    value,
    candidates: [],
  }))
}

/**
 * Generates a deterministic Sudoku puzzle for the given seed and difficulty.
 * Each attempt mixes the seed, fills a random solution, and carves clues
 * while enforcing the difficulty ceiling. An attempt succeeds immediately
 * when its carved rating matches the target difficulty exactly. If every
 * attempt falls short, the best candidate at or below the ceiling (closest
 * to the target) is returned instead of exceeding it.
 *
 * The returned puzzle's `difficulty` always reflects its *actual rated*
 * difficulty (per `rateSudoku`), never the requested target — a fallback
 * puzzle that undershoots the target must not be mislabeled as harder than
 * it really is.
 */
export function generateSudoku(options: GenerateSudokuOptions): SudokuPuzzle {
  const { difficulty, seed } = options
  const maxAttempts = options.maxAttempts ?? SUDOKU_GENERATE_MAX_ATTEMPTS
  const targetRank = DIFFICULTY_RANK[difficulty]

  let best: { givens: SudokuGrid; solution: SudokuGrid; rating: SudokuRating } | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptSeed = hashSeed(seed + attempt * ATTEMPT_SEED_STRIDE)
    const rng = createSudokuRng(attemptSeed)
    const solution = fillGrid(rng)
    const { givens, rating } = carve(solution, rng, difficulty)

    if (rating.difficulty === difficulty) {
      return buildPuzzle(givens, solution, seed, rating)
    }

    if (rating.solvable && rating.difficulty !== "unrated") {
      const rank = DIFFICULTY_RANK[rating.difficulty]
      const bestRank = best ? DIFFICULTY_RANK[best.rating.difficulty as SudokuDifficulty] : -1
      if (rank <= targetRank && rank > bestRank) {
        best = { givens, solution, rating }
      }
    }
  }

  if (best) {
    return buildPuzzle(best.givens, best.solution, seed, best.rating)
  }

  // Extremely unlikely fallback: every attempt somehow failed to produce a
  // solvable-and-rated candidate. Return the last attempt's full solution as
  // an unpermuted (fully given) puzzle rather than throwing.
  const rng = createSudokuRng(hashSeed(seed))
  const solution = fillGrid(rng)
  return buildPuzzle(solution.slice(), solution, seed, rateSudoku(solution))
}

/** `rating.difficulty` is guaranteed to be a real difficulty (never
 * "unrated") at every call site: either it matched the target exactly, or
 * it was accepted into `best`/computed from a fully-solved grid, both of
 * which require `rating.difficulty !== "unrated"`. */
function buildPuzzle(
  givens: SudokuGrid,
  solution: SudokuGrid,
  seed: number,
  rating: SudokuRating,
): SudokuPuzzle {
  return {
    givens,
    solution,
    difficulty: rating.difficulty as SudokuDifficulty,
    seed,
    ratingTechnique: rating.hardest ?? "naked-single",
  }
}
