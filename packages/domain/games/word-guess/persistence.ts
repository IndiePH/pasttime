import { getDailySeed } from "../../daily"

import type { WordGuessLength, WordGuessRoundMode } from "./settings"
import type { WordGuessRoundState } from "./types"

export interface StoredWordGuessGame {
  round: WordGuessRoundState
  currentGuess: string
}

function isWordGuessRoundState(
  value: unknown,
  length: WordGuessLength,
  mode: WordGuessRoundMode,
): value is WordGuessRoundState {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.answer === "string" &&
    record.length === length &&
    record.mode === mode &&
    typeof record.maxTries === "number" &&
    Array.isArray(record.guesses) &&
    (record.status === "playing" ||
      record.status === "won" ||
      record.status === "lost")
  )
}

export function parseStoredWordGuessGame(
  value: unknown,
  length: WordGuessLength,
  mode: WordGuessRoundMode,
): StoredWordGuessGame | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const round = record.round
  const currentGuess = record.currentGuess

  if (
    !isWordGuessRoundState(round, length, mode) ||
    typeof currentGuess !== "string" ||
    currentGuess.length > length
  ) {
    return null
  }

  return {
    round,
    currentGuess,
  }
}

function getWordGuessStorageScope(
  mode: WordGuessRoundMode,
  date = new Date(),
): string | number {
  if (mode === "daily") {
    return getDailySeed(date)
  }

  return "session"
}

export function getWordGuessSoloStorageKey(
  wordLength: WordGuessLength,
  mode: WordGuessRoundMode,
  date = new Date(),
): string {
  return `word-guess:solo:${mode}:${wordLength}:${getWordGuessStorageScope(mode, date)}`
}

export function isWordGuessDailyRoundFinished(
  round: WordGuessRoundState,
): boolean {
  return round.status === "won" || round.status === "lost"
}

export function isWordGuessDailyCompleted(
  stored: unknown,
  wordLength: WordGuessLength,
): boolean {
  const parsed = parseStoredWordGuessGame(stored, wordLength, "daily")
  if (!parsed) {
    return false
  }

  return isWordGuessDailyRoundFinished(parsed.round)
}
