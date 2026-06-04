import { getDailySeed } from "@/domain/daily"

import { getWordGuessDictionaryByLength } from "./dictionary"
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

function hashSeed(seed: number): number {
  let value = seed | 0
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value ^= value >>> 16
  return value >>> 0
}

export function pickWordGuessAnswer(
  length: WordGuessLength,
  mode: WordGuessRoundMode,
  date = new Date(),
): string {
  const words = getWordGuessDictionaryByLength(length)

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
