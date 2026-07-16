import {
  isWordGuessLength,
  type WordGuessLength,
} from "./settings"

const LETTERS_ONLY_PATTERN = /^[A-Z]+$/

export function normalizeWordGuessWord(value: string): string {
  return value.trim().toUpperCase()
}

export function isWordGuessValidWord(
  rawWord: string,
  length: WordGuessLength,
  guessableSet: ReadonlySet<string>,
): boolean {
  const word = normalizeWordGuessWord(rawWord)
  if (word.length !== length || !LETTERS_ONLY_PATTERN.test(word)) {
    return false
  }

  return guessableSet.has(word)
}

export function isWordGuessDictionaryLength(value: number): value is WordGuessLength {
  return isWordGuessLength(value)
}
