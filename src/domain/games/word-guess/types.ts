import type { WordGuessLength, WordGuessRoundMode } from "./settings"

export type WordGuessLetterState = "correct" | "present" | "absent"

export interface WordGuessLetterResult {
  letter: string
  state: WordGuessLetterState
}

export interface WordGuessGuessEvaluation {
  guess: string
  letters: WordGuessLetterResult[]
  isCorrect: boolean
}

export type WordGuessRoundStatus = "playing" | "won" | "lost"

export interface WordGuessRoundState {
  answer: string
  length: WordGuessLength
  mode: WordGuessRoundMode
  maxTries: number
  guesses: WordGuessGuessEvaluation[]
  status: WordGuessRoundStatus
}

export type WordGuessSubmitErrorCode =
  | "round-complete"
  | "invalid-length"
  | "invalid-word"

export type WordGuessSubmitGuessResult =
  | {
      ok: true
      round: WordGuessRoundState
      evaluation: WordGuessGuessEvaluation
    }
  | {
      ok: false
      round: WordGuessRoundState
      reason: WordGuessSubmitErrorCode
    }
