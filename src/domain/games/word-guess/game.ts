import { evaluateWordGuessGuess } from "./evaluate-guess"
import { isWordGuessValidWord, normalizeWordGuessWord } from "./dictionary"
import { pickWordGuessAnswer } from "./pick-target-word"
import {
  WORD_GUESS_MAX_TRIES,
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
  date?: Date
}

export function createWordGuessRound({
  length,
  mode,
  date,
}: CreateWordGuessRoundOptions): WordGuessRoundState {
  return {
    answer: pickWordGuessAnswer(length, mode, date),
    length,
    mode,
    maxTries: WORD_GUESS_MAX_TRIES,
    guesses: [],
    status: "playing",
  }
}

export function canSubmitWordGuess(round: WordGuessRoundState): boolean {
  return round.status === "playing" && round.guesses.length < round.maxTries
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
