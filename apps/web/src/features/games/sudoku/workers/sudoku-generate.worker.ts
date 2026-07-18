/// <reference lib="webworker" />

import { generateSudoku } from "@pasttime/domain/games/sudoku"
import type { SudokuDifficulty, SudokuPuzzle } from "@pasttime/domain/games/sudoku"

/** Request/response protocol for the Sudoku generation worker. */
export interface SudokuGenerateRequest {
  difficulty: SudokuDifficulty
  seed: number
}
export type SudokuGenerateResponse =
  | { ok: true; puzzle: SudokuPuzzle }
  | { ok: false; error: string }

self.onmessage = (event: MessageEvent<SudokuGenerateRequest>) => {
  try {
    const puzzle = generateSudoku(event.data)
    const response: SudokuGenerateResponse = { ok: true, puzzle }
    self.postMessage(response)
  } catch (error) {
    const response: SudokuGenerateResponse = {
      ok: false,
      error: error instanceof Error ? error.message : "generate failed",
    }
    self.postMessage(response)
  }
}
