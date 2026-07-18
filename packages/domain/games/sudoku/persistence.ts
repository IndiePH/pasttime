import { getDailySeed } from "../../daily"
import type { SudokuDifficulty, SudokuRoundMode } from "./settings"
import type { SudokuCell, SudokuDigit, SudokuGameState, SudokuPuzzle, SudokuTechnique } from "./types"

/** Ordered human-technique ladder — kept in sync with rate.ts's TECHNIQUE_ORDER. */
const VALID_TECHNIQUES = new Set<string>([
  "naked-single",
  "hidden-single",
  "naked-pair",
  "hidden-pair",
  "locked-candidate",
  "naked-triple",
  "hidden-triple",
])

const VALID_STATUSES = new Set<string>(["playing", "won", "abandoned"])

export function getSudokuStorageKey(
  difficulty: SudokuDifficulty,
  mode: SudokuRoundMode,
  date = new Date(),
): string {
  if (mode === "daily") {
    return `sudoku:daily:${difficulty}:${getDailySeed(date)}`
  }
  return `sudoku:random:${difficulty}`
}

export function parseStoredSudokuGame(
  value: unknown,
  difficulty: SudokuDifficulty,
  mode: SudokuRoundMode,
): SudokuGameState | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>

  if (record.mode !== mode) return null
  if (record.difficulty !== difficulty) return null
  if (!isValidStatus(record.status)) return null
  if (typeof record.candidateMode !== "boolean") return null
  if (typeof record.autoCandidates !== "boolean") return null
  if (!isValidSelectedIndex(record.selectedIndex)) return null
  if (typeof record.startedAt !== "number") return null
  if (typeof record.elapsedMs !== "number") return null

  const puzzle = parsePuzzle(record.puzzle, difficulty)
  if (!puzzle) return null

  const cells = parseCells(record.cells)
  if (!cells) return null

  const undoStack = parseUndoStack(record.undoStack)
  if (!undoStack) return null

  return {
    puzzle,
    cells,
    status: record.status,
    mode,
    difficulty,
    candidateMode: record.candidateMode,
    autoCandidates: record.autoCandidates,
    selectedIndex: record.selectedIndex,
    undoStack,
    startedAt: record.startedAt,
    elapsedMs: record.elapsedMs,
  }
}

function isValidStatus(value: unknown): value is SudokuGameState["status"] {
  return typeof value === "string" && VALID_STATUSES.has(value)
}

function isValidSelectedIndex(value: unknown): value is number | null {
  if (value === null) return true
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 80
}

function isValidGrid(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 81 &&
    value.every((v) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 9)
  )
}

function parsePuzzle(value: unknown, difficulty: SudokuDifficulty): SudokuPuzzle | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>

  if (!isValidGrid(record.givens) || !isValidGrid(record.solution)) return null
  if (record.difficulty !== difficulty) return null
  if (typeof record.seed !== "number") return null
  if (typeof record.ratingTechnique !== "string" || !VALID_TECHNIQUES.has(record.ratingTechnique)) return null

  return {
    givens: record.givens,
    solution: record.solution,
    difficulty,
    seed: record.seed,
    ratingTechnique: record.ratingTechnique as SudokuTechnique,
  }
}

function isValidCell(value: unknown): value is { given: boolean; value: number; candidates: SudokuDigit[] } {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>

  return (
    typeof record.given === "boolean" &&
    typeof record.value === "number" &&
    Number.isInteger(record.value) &&
    record.value >= 0 &&
    record.value <= 9 &&
    Array.isArray(record.candidates) &&
    record.candidates.every(
      (d) => typeof d === "number" && Number.isInteger(d) && d >= 1 && d <= 9,
    )
  )
}

function parseCells(value: unknown): SudokuCell[] | null {
  if (!Array.isArray(value) || value.length !== 81) return null

  const cells: SudokuCell[] = []
  for (const candidate of value) {
    if (!isValidCell(candidate)) return null
    cells.push({
      given: candidate.given,
      value: candidate.value,
      candidates: [...candidate.candidates],
    })
  }
  return cells
}

function parseUndoStack(value: unknown): SudokuCell[][] | null {
  if (!Array.isArray(value)) return null

  const stack: SudokuCell[][] = []
  for (const snapshot of value) {
    const cells = parseCells(snapshot)
    if (!cells) return null
    stack.push(cells)
  }
  return stack
}
