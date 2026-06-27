import dictionaryData from "../shared/dictionary.target.json"
import fullDictionaryData from "../shared/dictionary.full.json"
import {
  isWordGuessLength,
  type WordGuessLength,
} from "./settings"

type WordGuessDictionary = Record<WordGuessLength, readonly string[]>

function getDictionaryWordsByLength(length: WordGuessLength): readonly string[] {
  return dictionaryData[String(length) as keyof typeof dictionaryData] ?? []
}

const WORD_GUESS_DICTIONARY: WordGuessDictionary = {
  3: getDictionaryWordsByLength(3),
  4: getDictionaryWordsByLength(4),
  5: getDictionaryWordsByLength(5),
  6: getDictionaryWordsByLength(6),
  7: getDictionaryWordsByLength(7),
  8: getDictionaryWordsByLength(8),
  9: getDictionaryWordsByLength(9),
  10: getDictionaryWordsByLength(10),
}

// Answer words — used to select the target word each round.
const WORD_GUESS_DICTIONARY_SET = new Map<WordGuessLength, ReadonlySet<string>>(
  Object.entries(WORD_GUESS_DICTIONARY).map(([length, words]) => [
    Number(length) as WordGuessLength,
    new Set(words),
  ]),
)

// Full word list — used to validate player input. Includes plurals, verb forms,
// etc. so BANKS, RUNNING, and similar are accepted as guesses even though they
// are not answer candidates.
const WORD_GUESS_FULL_DICTIONARY_SET = new Map<WordGuessLength, ReadonlySet<string>>(
  Object.entries(fullDictionaryData).map(([length, words]) => [
    Number(length) as WordGuessLength,
    new Set(words as string[]),
  ]),
)

const LETTERS_ONLY_PATTERN = /^[A-Z]+$/

export function normalizeWordGuessWord(value: string): string {
  return value.trim().toUpperCase()
}

export function getWordGuessDictionaryByLength(
  length: WordGuessLength,
): readonly string[] {
  return WORD_GUESS_DICTIONARY[length]
}

export function isWordGuessValidWord(
  rawWord: string,
  length: WordGuessLength,
): boolean {
  const word = normalizeWordGuessWord(rawWord)
  if (word.length !== length || !LETTERS_ONLY_PATTERN.test(word)) {
    return false
  }

  return WORD_GUESS_FULL_DICTIONARY_SET.get(length)?.has(word) ?? false
}

export function isWordGuessDictionaryLength(value: number): value is WordGuessLength {
  return isWordGuessLength(value)
}
