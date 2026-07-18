import type { SudokuDifficulty, SudokuRoundMode } from "./settings"

export type SudokuDigit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type SudokuStatus = "playing" | "won" | "abandoned"
export type SudokuTechnique =
  | "naked-single"
  | "hidden-single"
  | "naked-pair"
  | "hidden-pair"
  | "locked-candidate"
  | "naked-triple"
  | "hidden-triple"

/** 0 = empty for puzzle/solution grids of digits. */
export type SudokuGrid = number[] // length 81, values 0–9

export interface SudokuCell {
  /** Given clue — immutable when true. */
  given: boolean
  /** Player digit or 0 if empty. */
  value: number
  /** Candidate marks 1–9. */
  candidates: SudokuDigit[]
}

export interface SudokuPuzzle {
  /** Starting clues (0 empty). */
  givens: SudokuGrid
  /** Unique solution digits 1–9. */
  solution: SudokuGrid
  difficulty: SudokuDifficulty
  /** Seed used to generate (daily seed or random). */
  seed: number
  /** Hardest technique required (from rater). */
  ratingTechnique: SudokuTechnique
}

export interface SudokuGameState {
  puzzle: SudokuPuzzle
  cells: SudokuCell[] // length 81
  status: SudokuStatus
  mode: SudokuRoundMode
  difficulty: SudokuDifficulty
  /** Candidate entry mode (Normal vs Candidates). */
  candidateMode: boolean
  /** When true, candidates auto-filled/pruned. */
  autoCandidates: boolean
  selectedIndex: number | null
  /** Snapshots for undo: serialized cells arrays. */
  undoStack: SudokuCell[][]
  /** Epoch ms when current play segment started. */
  startedAt: number
  /** Accumulated elapsed ms excluding current segment (usually 0 in v1). */
  elapsedMs: number
}

export type { SudokuDifficulty, SudokuRoundMode }
