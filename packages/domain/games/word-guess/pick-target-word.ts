import { getDailySeed, hashSeed } from "../../daily"

import type { WordGuessLength, WordGuessRoundMode } from "./settings"

export function getWordGuessRoundSeed(
  mode: WordGuessRoundMode,
  date = new Date(),
): number | null {
  if (mode === "daily") {
    return getDailySeed(date)
  }

  return null
}

export function pickWordGuessAnswer(
  length: WordGuessLength,
  mode: WordGuessRoundMode,
  answerWords: readonly string[],
  date = new Date(),
): string {
  const words = answerWords.map((word) => word.toUpperCase())

  if (words.length === 0) {
    throw new Error(`No dictionary words found for length ${length}`)
  }

  if (mode === "daily") {
    const seed = getDailySeed(date)
    const index = hashSeed(seed + length * 97) % words.length
    return words[index]
  }

  const index = Math.floor(Math.random() * words.length)
  return words[index]
}
