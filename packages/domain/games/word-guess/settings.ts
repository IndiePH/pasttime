/** Maximum guesses per Word Guess round. */
export const WORD_GUESS_MAX_TRIES = 6

/** Allowed word lengths for Word Guess sessions. */
export const WORD_GUESS_LENGTHS = [5, 6, 7, 8, 9, 10] as const

export type WordGuessLength = (typeof WORD_GUESS_LENGTHS)[number]

export const WORD_GUESS_LENGTH_DEFAULT: WordGuessLength = 5

export const WORD_GUESS_ROUND_MODES = ["random", "daily"] as const

export type WordGuessRoundMode = (typeof WORD_GUESS_ROUND_MODES)[number]

export const WORD_GUESS_ROUND_MODE_DEFAULT: WordGuessRoundMode = "random"

const LENGTH_SET = new Set<number>(WORD_GUESS_LENGTHS)

export function isWordGuessLength(value: number): value is WordGuessLength {
  return LENGTH_SET.has(value)
}

export function parseWordGuessLength(
  raw: string | null | undefined,
): WordGuessLength {
  const parsed = Number(raw)
  if (isWordGuessLength(parsed)) {
    return parsed
  }
  return WORD_GUESS_LENGTH_DEFAULT
}

export function formatWordLengthLabel(length: WordGuessLength): string {
  return `${length}-letter word`
}

const ROUND_MODE_SET = new Set<string>(WORD_GUESS_ROUND_MODES)

export function isWordGuessRoundMode(value: string): value is WordGuessRoundMode {
  return ROUND_MODE_SET.has(value)
}

export function parseWordGuessRoundMode(
  raw: string | null | undefined,
): WordGuessRoundMode {
  if (raw && isWordGuessRoundMode(raw)) {
    return raw
  }

  return WORD_GUESS_ROUND_MODE_DEFAULT
}

export function formatWordGuessRoundModeLabel(mode: WordGuessRoundMode): string {
  if (mode === "daily") {
    return "Daily puzzle"
  }

  return "Random puzzle"
}
