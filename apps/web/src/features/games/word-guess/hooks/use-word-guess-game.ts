"use client"

import * as React from "react"

import {
  createWordGuessRound,
  getWordGuessSoloStorageKey,
  parseStoredWordGuessGame,
  submitWordGuessGuess,
  type WordGuessGuessEvaluation,
  type WordGuessLength,
  type WordGuessLetterState,
  type WordGuessRoundMode,
  type WordGuessRoundState,
} from "@pasttime/domain/games/word-guess"
import { useStorage } from "@/infrastructure/storage"
import type { WordGuessBoardRow } from "@/features/games/word-guess/components/word-guess-board"

type KeyboardStates = Partial<Record<string, WordGuessLetterState>>

interface UseWordGuessGameOptions {
  wordLength: WordGuessLength
  roundMode: WordGuessRoundMode
}

const LETTER_PATTERN = /^[A-Z]$/

const KEY_STATE_PRIORITY: Record<WordGuessLetterState, number> = {
  absent: 1,
  present: 2,
  correct: 3,
}

function createRound(length: WordGuessLength, mode: WordGuessRoundMode): WordGuessRoundState {
  return createWordGuessRound({ length, mode })
}

function buildBoardRows(
  guesses: WordGuessGuessEvaluation[],
  currentGuess: string,
  wordLength: WordGuessLength,
  maxTries: number,
  isPlaying: boolean,
): WordGuessBoardRow[] {
  return Array.from({ length: maxTries }, (_, rowIndex) => {
    const submitted = guesses[rowIndex]
    if (submitted) {
      return {
        id: `row-${rowIndex}`,
        letters: submitted.letters.map((item) => item.letter),
        states: submitted.letters.map((item) => item.state),
      }
    }

    const activeGuess =
      rowIndex === guesses.length && isPlaying ? currentGuess.toUpperCase() : ""

    return {
      id: `row-${rowIndex}`,
      letters: Array.from({ length: wordLength }, (_, columnIndex) => {
        return activeGuess[columnIndex] ?? ""
      }),
      states: Array.from({ length: wordLength }, (_, columnIndex) => {
        return activeGuess[columnIndex] ? "filled" : "empty"
      }),
    }
  })
}

function buildKeyboardStates(guesses: WordGuessGuessEvaluation[]): KeyboardStates {
  const keyStates: KeyboardStates = {}

  for (const guess of guesses) {
    for (const item of guess.letters) {
      const current = keyStates[item.letter]
      if (!current || KEY_STATE_PRIORITY[item.state] > KEY_STATE_PRIORITY[current]) {
        keyStates[item.letter] = item.state
      }
    }
  }

  return keyStates
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return target.closest("input, textarea, select") !== null
}

function messageForInvalidGuess(length: WordGuessLength, reason: string): string {
  if (reason === "invalid-length") {
    return `Guess must be exactly ${length} letters.`
  }

  if (reason === "invalid-word") {
    return "Word not in dictionary."
  }

  return "Round is complete. Start a new one."
}

export function useWordGuessGame({
  wordLength,
  roundMode,
}: UseWordGuessGameOptions) {
  const storage = useStorage()
  const storageKey = React.useMemo(
    () => getWordGuessSoloStorageKey(wordLength, roundMode),
    [roundMode, wordLength],
  )
  const initialGame = React.useMemo(() => {
    return (
      parseStoredWordGuessGame(storage.get<unknown>(storageKey), wordLength, roundMode) ?? {
        round: createRound(wordLength, roundMode),
        currentGuess: "",
      }
    )
  }, [roundMode, storage, storageKey, wordLength])
  const [round, setRound] = React.useState<WordGuessRoundState>(initialGame.round)
  const [currentGuess, setCurrentGuess] = React.useState(initialGame.currentGuess)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const [invalidWordShake, setInvalidWordShake] = React.useState<{
    rowIndex: number
    trigger: number
  } | null>(null)

  React.useEffect(() => {
    storage.set(storageKey, {
      round,
      currentGuess,
      status: round.status,
    })
  }, [currentGuess, round, storage, storageKey])

  const isPlaying = round.status === "playing"
  const attemptsUsed = round.guesses.length

  const addLetter = React.useCallback(
    (letter: string) => {
      if (!isPlaying) {
        return
      }

      const next = letter.toUpperCase()
      if (!LETTER_PATTERN.test(next)) {
        return
      }

      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) {
          return prev
        }
        return `${prev}${next}`
      })
      setFeedback(null)
    },
    [isPlaying, wordLength],
  )

  const removeLetter = React.useCallback(() => {
    if (!isPlaying) {
      return
    }

    setCurrentGuess((prev) => prev.slice(0, -1))
    setFeedback(null)
  }, [isPlaying])

  const submitGuess = React.useCallback(() => {
    const result = submitWordGuessGuess(round, currentGuess)
    if (!result.ok) {
      setFeedback(messageForInvalidGuess(wordLength, result.reason))
      if (result.reason === "invalid-word") {
        setInvalidWordShake((prev) => ({
          rowIndex: round.guesses.length,
          trigger: (prev?.trigger ?? 0) + 1,
        }))
      }
      return
    }

    setInvalidWordShake(null)
    setRound(result.round)
    setCurrentGuess("")
    if (result.round.status === "won") {
      setFeedback("You solved it.")
      return
    }
    if (result.round.status === "lost") {
      setFeedback(`Round over. Answer was ${result.round.answer}.`)
      return
    }

    setFeedback(null)
  }, [currentGuess, round, wordLength])

  const resetRound = React.useCallback(() => {
    setRound(createRound(wordLength, roundMode))
    setCurrentGuess("")
    setFeedback(null)
    setInvalidWordShake(null)
  }, [roundMode, wordLength])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key === "Enter") {
        event.preventDefault()
        submitGuess()
        return
      }

      if (event.key === "Backspace") {
        event.preventDefault()
        removeLetter()
        return
      }

      if (event.key.length === 1 && LETTER_PATTERN.test(event.key.toUpperCase())) {
        event.preventDefault()
        addLetter(event.key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [addLetter, removeLetter, submitGuess])

  const boardRows = React.useMemo(
    () =>
      buildBoardRows(
        round.guesses,
        currentGuess,
        wordLength,
        round.maxTries,
        isPlaying,
      ),
    [currentGuess, isPlaying, round.guesses, round.maxTries, wordLength],
  )
  const keyboardStates = React.useMemo(
    () => buildKeyboardStates(round.guesses),
    [round.guesses],
  )

  return {
    attemptsUsed,
    boardRows,
    canSubmit: isPlaying && currentGuess.length === wordLength,
    currentGuess,
    feedback,
    invalidWordShake,
    isPlaying,
    keyboardStates,
    round,
    addLetter,
    removeLetter,
    resetRound,
    submitGuess,
  }
}
