import { getDailySeed } from "../../daily"

import { generateCrosswordPuzzle, generateCrosswordPuzzleWithRetry } from "./generator"
import type {
  CrosswordGameState,
  CrosswordGridSize,
  CrosswordPuzzle,
  CrosswordRoundMode,
} from "./types"

export type { CrosswordGridSize, CrosswordRoundMode } from "./types"

export const CROSSWORD_GRID_SIZE_DEFAULT: CrosswordGridSize = 7

export const CROSSWORD_ROUND_MODE_DEFAULT: CrosswordRoundMode = "daily"

function resolveSeed(mode: CrosswordRoundMode | undefined, date?: Date): number {
  if (mode === "daily") {
    return getDailySeed(date ?? new Date())
  }
  return Math.floor(Math.random() * 1_000_000)
}

/**
 * Build a crossword puzzle for the given size and round mode. Daily mode is
 * deterministic (seeded from the calendar date); random mode picks a fresh
 * seed each call. Delegates to the corpus-backed generator so every puzzle has
 * real interlocking answers, clues, and per-cell answer letters.
 */
export function createCrosswordPuzzle(
  size: CrosswordGridSize = CROSSWORD_GRID_SIZE_DEFAULT,
  mode?: CrosswordRoundMode,
  date?: Date,
): CrosswordPuzzle {
  const seed = resolveSeed(mode, date)
  // Use the base generator directly (fast, deterministic, no quality gating).
  // Callers that need quality guarantees should use generateCrosswordPuzzleWithRetry.
  return generateCrosswordPuzzle(size, seed)
}

export function createCrosswordGameState(
  size: CrosswordGridSize = CROSSWORD_GRID_SIZE_DEFAULT,
  mode: CrosswordRoundMode = CROSSWORD_ROUND_MODE_DEFAULT,
  date?: Date,
): CrosswordGameState {
  const puzzle = createCrosswordPuzzle(size, mode, date)
  return {
    puzzle,
    inputs: {},
    status: "playing" as const,
  }
}
