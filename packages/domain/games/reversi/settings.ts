import type { Difficulty } from "./types"

export const REVERSI_DIFFICULTIES = ["easy", "medium", "hard"] as const
export const REVERSI_DIFFICULTY_DEFAULT: Difficulty = "medium"

const DIFFICULTIES = new Set<string>(REVERSI_DIFFICULTIES)

export function isDifficulty(value: string): value is Difficulty {
  return DIFFICULTIES.has(value)
}

export function formatDifficultyLabel(difficulty: Difficulty): string {
  if (difficulty === "easy") {
    return "Easy"
  }
  if (difficulty === "medium") {
    return "Medium"
  }
  return "Hard"
}
