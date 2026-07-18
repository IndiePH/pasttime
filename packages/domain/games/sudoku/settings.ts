export const SUDOKU_DIFFICULTIES = ["easy", "medium", "hard"] as const
export type SudokuDifficulty = (typeof SUDOKU_DIFFICULTIES)[number]
export const SUDOKU_DIFFICULTY_DEFAULT: SudokuDifficulty = "easy"

/** Ordinal rank per difficulty — lower is easier. Used to compare/ceiling difficulties. */
export const SUDOKU_DIFFICULTY_RANK: Record<SudokuDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
}

export const SUDOKU_ROUND_MODES = ["daily", "random"] as const
export type SudokuRoundMode = (typeof SUDOKU_ROUND_MODES)[number]
export const SUDOKU_ROUND_MODE_DEFAULT: SudokuRoundMode = "daily"

const DIFF_SET = new Set<string>(SUDOKU_DIFFICULTIES)
const MODE_SET = new Set<string>(SUDOKU_ROUND_MODES)

export function isSudokuDifficulty(v: string): v is SudokuDifficulty {
  return DIFF_SET.has(v)
}
export function parseSudokuDifficulty(raw: string | null | undefined): SudokuDifficulty {
  if (raw && isSudokuDifficulty(raw)) return raw
  return SUDOKU_DIFFICULTY_DEFAULT
}
export function isSudokuRoundMode(v: string): v is SudokuRoundMode {
  return MODE_SET.has(v)
}
export function parseSudokuRoundMode(raw: string | null | undefined): SudokuRoundMode {
  if (raw && isSudokuRoundMode(raw)) return raw
  return SUDOKU_ROUND_MODE_DEFAULT
}
export function formatSudokuDifficultyLabel(d: SudokuDifficulty): string {
  return d.charAt(0).toUpperCase() + d.slice(1)
}
