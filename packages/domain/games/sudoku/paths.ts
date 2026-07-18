import { gameLaunchPath, gamePlayPath } from "../paths"
import type { SudokuDifficulty, SudokuRoundMode } from "./settings"

export function sudokuLaunchPath(difficulty?: SudokuDifficulty): string {
  const path = gameLaunchPath("sudoku")
  return difficulty ? `${path}?difficulty=${difficulty}` : path
}

export function sudokuPlayPath(
  difficulty: SudokuDifficulty,
  mode: SudokuRoundMode,
): string {
  const path = gamePlayPath("sudoku")
  const q = new URLSearchParams({ difficulty, mode })
  return `${path}?${q.toString()}`
}
