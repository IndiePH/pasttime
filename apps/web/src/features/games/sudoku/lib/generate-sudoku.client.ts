import { generateSudoku } from "@pasttime/domain/games/sudoku"
import type { SudokuDifficulty, SudokuPuzzle } from "@pasttime/domain/games/sudoku"

import type {
  SudokuGenerateRequest,
  SudokuGenerateResponse,
} from "../workers/sudoku-generate.worker"

const SUDOKU_WORKER_TIMEOUT_MS = 8000

/**
 * Generates a Sudoku puzzle off the main thread via a dedicated Web Worker,
 * falling back to synchronous main-thread generation only when `Worker` is
 * unavailable (e.g. during SSR or in environments without Worker support).
 * Rejects if generation exceeds `SUDOKU_WORKER_TIMEOUT_MS`.
 */
export function generateSudokuInWorker(
  difficulty: SudokuDifficulty,
  seed: number,
): Promise<SudokuPuzzle> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(generateSudoku({ difficulty, seed }))
  }

  return new Promise<SudokuPuzzle>((resolve, reject) => {
    const worker = new Worker(new URL("../workers/sudoku-generate.worker.ts", import.meta.url))

    const settle = (fn: () => void) => {
      clearTimeout(timeoutId)
      worker.removeEventListener("message", onMessage)
      worker.removeEventListener("error", onError)
      worker.terminate()
      fn()
    }

    const onMessage = (event: MessageEvent<SudokuGenerateResponse>) => {
      settle(() => {
        if (event.data.ok) {
          resolve(event.data.puzzle)
        } else {
          reject(new Error(event.data.error))
        }
      })
    }

    const onError = (event: ErrorEvent) => {
      settle(() => {
        reject(new Error(event.message || "Sudoku generation worker failed"))
      })
    }

    const timeoutId = setTimeout(() => {
      settle(() => {
        reject(new Error("Sudoku generation timed out"))
      })
    }, SUDOKU_WORKER_TIMEOUT_MS)

    worker.addEventListener("message", onMessage)
    worker.addEventListener("error", onError)

    const request: SudokuGenerateRequest = { difficulty, seed }
    worker.postMessage(request)
  })
}
