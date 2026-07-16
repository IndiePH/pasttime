import { getDailySeed } from "../../daily"

import {
  generateCrosswordPuzzleWithRetry,
  hydrateCrosswordClues,
  type CrosswordPoolWord,
} from "./generator"
import type {
  CrosswordGameState,
  CrosswordGridSize,
  CrosswordPuzzle,
  CrosswordRoundMode,
} from "./types"

export type { CrosswordGridSize, CrosswordRoundMode } from "./types"

export const CROSSWORD_GRID_SIZE_DEFAULT: CrosswordGridSize = 15

export const CROSSWORD_ROUND_MODE_DEFAULT: CrosswordRoundMode = "daily"

function resolveSeed(mode: CrosswordRoundMode | undefined, date?: Date): number {
  if (mode === "daily") {
    return getDailySeed(date ?? new Date())
  }
  return Math.floor(Math.random() * 1_000_000)
}

export interface CreateCrosswordPuzzleOptions {
  pool: readonly CrosswordPoolWord[]
  size?: CrosswordGridSize
  mode?: CrosswordRoundMode
  date?: Date
  cluesByAnswer?: ReadonlyMap<string, string>
}

/**
 * Build a crossword puzzle for the given size and round mode. Daily mode is
 * deterministic (seeded from the calendar date); random mode picks a fresh
 * seed each call.
 */
export function createCrosswordPuzzle({
  pool,
  size = CROSSWORD_GRID_SIZE_DEFAULT,
  mode,
  date,
  cluesByAnswer,
}: CreateCrosswordPuzzleOptions): CrosswordPuzzle {
  const seed = resolveSeed(mode, date)
  const puzzle = generateCrosswordPuzzleWithRetry(size, seed, pool)
  if (!puzzle) {
    throw new Error(
      `Failed to generate a valid crossword puzzle (size=${size}, seed=${seed}) after 3 attempts`,
    )
  }

  if (cluesByAnswer && cluesByAnswer.size > 0) {
    return hydrateCrosswordClues(puzzle, cluesByAnswer)
  }

  return puzzle
}

export interface CreateCrosswordGameStateOptions extends CreateCrosswordPuzzleOptions {
  mode?: CrosswordRoundMode
}

export function createCrosswordGameState(
  options: CreateCrosswordGameStateOptions,
): CrosswordGameState {
  const puzzle = createCrosswordPuzzle(options)
  return {
    puzzle,
    inputs: {},
    status: "playing" as const,
  }
}
