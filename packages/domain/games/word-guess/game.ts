import { evaluateWordGuessGuess } from "./evaluate-guess"
import { isWordGuessValidWord, normalizeWordGuessWord } from "./dictionary"
import { pickWordGuessAnswer } from "./pick-target-word"
import {
  getWordGuessMaxTries,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "./settings"
import type {
  WordGuessRoundState,
  WordGuessSubmitGuessResult,
} from "./types"

interface CreateWordGuessRoundOptions {
  length: WordGuessLength
  mode: WordGuessRoundMode
  hardMode?: boolean
  date?: Date
}

export function createWordGuessRound({
  length,
  mode,
  hardMode = false,
  date,
}: CreateWordGuessRoundOptions): WordGuessRoundState {
  return {
    answer: pickWordGuessAnswer(length, mode, date),
    length,
    mode,
    hardMode,
    maxTries: getWordGuessMaxTries(length),
    guesses: [],
    status: "playing",
  }
}

export function canSubmitWordGuess(round: WordGuessRoundState): boolean {
  return round.status === "playing" && round.guesses.length < round.maxTries
}

function checkHardModeViolation(
  round: WordGuessRoundState,
  guess: string,
): boolean {
  for (const prevGuess of round.guesses) {
    for (let i = 0; i < prevGuess.letters.length; i++) {
      if (prevGuess.letters[i]?.state === "correct") {
        if (guess[i] !== prevGuess.letters[i]?.letter) {
          return true
        }
      }
    }
  }
  return false
}

export function submitWordGuessGuess(
  round: WordGuessRoundState,
  guessRaw: string,
): WordGuessSubmitGuessResult {
  if (!canSubmitWordGuess(round)) {
    return {
      ok: false,
      round,
      reason: "round-complete",
    }
  }

  const guess = normalizeWordGuessWord(guessRaw)
  if (guess.length !== round.length) {
    return {
      ok: false,
      round,
      reason: "invalid-length",
    }
  }

  if (!isWordGuessValidWord(guess, round.length)) {
    return {
      ok: false,
      round,
      reason: "invalid-word",
    }
  }

  if (round.hardMode && checkHardModeViolation(round, guess)) {
    return {
      ok: false,
      round,
      reason: "locked-letters-violation",
    }
  }

  const evaluation = evaluateWordGuessGuess(round.answer, guess)
  const guesses = [...round.guesses, evaluation]
  const status = evaluation.isCorrect
    ? "won"
    : guesses.length >= round.maxTries
      ? "lost"
      : "playing"
  const nextRound: WordGuessRoundState = {
    ...round,
    guesses,
    status,
  }

  return {
    ok: true,
    round: nextRound,
    evaluation,
  }
}
