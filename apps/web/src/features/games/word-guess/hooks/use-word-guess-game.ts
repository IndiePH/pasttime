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
import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { useStorage } from "@/infrastructure/storage"
import type { WordGuessBoardRow } from "@/features/games/word-guess/components/word-guess-board"

type KeyboardStates = Partial<Record<string, WordGuessLetterState>>

interface UseWordGuessGameOptions {
  wordLength: WordGuessLength
  roundMode: WordGuessRoundMode
  hardMode?: boolean
  answerWords: readonly string[]
  guessableSet: ReadonlySet<string>
}

const LETTER_PATTERN = /^[A-Z]$/

const KEY_STATE_PRIORITY: Record<WordGuessLetterState, number> = {
  absent: 1,
  present: 2,
  correct: 3,
}

function createRound(
  length: WordGuessLength,
  mode: WordGuessRoundMode,
  hardMode: boolean,
  answerWords: readonly string[],
): WordGuessRoundState {
  return createWordGuessRound({ length, mode, hardMode, answerWords })
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

interface GuessDraft {
  guess: string
  column: number | null
}

type GuessDraftAction =
  | { type: "letter"; letter: string; wordLength: number }
  | { type: "backspace" }
  | { type: "select"; column: number; wordLength: number }
  | { type: "move"; direction: -1 | 1; wordLength: number }
  | { type: "clear" }

function editableEnd(guessLength: number, wordLength: number): number {
  return guessLength >= wordLength ? wordLength - 1 : guessLength
}

function reduceGuessDraft(state: GuessDraft, action: GuessDraftAction): GuessDraft {
  switch (action.type) {
    case "clear":
      return { guess: "", column: null }
    case "letter": {
      const { letter, wordLength } = action
      const { guess, column } = state
      if (column === null || column >= guess.length) {
        if (guess.length >= wordLength) {
          return state
        }
        const nextGuess = `${guess}${letter}`
        if (column === null || nextGuess.length >= wordLength) {
          return { guess: nextGuess, column: null }
        }
        return { guess: nextGuess, column: nextGuess.length }
      }

      const nextGuess = `${guess.slice(0, column)}${letter}${guess.slice(column + 1)}`
      return {
        guess: nextGuess,
        column: column + 1 < wordLength ? column + 1 : column,
      }
    }
    case "backspace": {
      const { guess, column } = state
      if (guess.length === 0) {
        return state
      }
      if (column === null || column >= guess.length) {
        const nextGuess = guess.slice(0, -1)
        if (column === null) {
          return { guess: nextGuess, column: null }
        }
        return { guess: nextGuess, column: nextGuess.length }
      }
      const nextGuess = `${guess.slice(0, column)}${guess.slice(column + 1)}`
      return { guess: nextGuess, column: Math.min(column, nextGuess.length) }
    }
    case "select": {
      if (!Number.isInteger(action.column) || action.column < 0 || action.wordLength <= 0) {
        return state
      }
      const max = editableEnd(state.guess.length, action.wordLength)
      return { ...state, column: Math.min(action.column, max) }
    }
    case "move": {
      const end = editableEnd(state.guess.length, action.wordLength)
      if (state.column === null) {
        if (action.direction < 0) {
          if (state.guess.length === 0) {
            return state
          }
          return { ...state, column: state.guess.length - 1 }
        }
        return { ...state, column: end }
      }
      const next = state.column + action.direction
      if (next < 0 || next > end) {
        return state
      }
      return { ...state, column: next }
    }
    default:
      return state
  }
}

function messageForInvalidGuess(length: WordGuessLength, reason: string): string {
  if (reason === "invalid-length") {
    return `Guess must be exactly ${length} letters.`
  }

  if (reason === "invalid-word") {
    return "Word not in dictionary."
  }

  if (reason === "locked-letters-violation") {
    return "Must reuse correctly-placed letters in the same positions"
  }

  return "Round is complete. Start a new one."
}

export function useWordGuessGame({
  wordLength,
  roundMode,
  hardMode = false,
  answerWords,
  guessableSet,
}: UseWordGuessGameOptions) {
  const storage = useStorage()
  const storageKey = React.useMemo(
    () => getWordGuessSoloStorageKey(wordLength, roundMode),
    [roundMode, wordLength],
  )
  const initialGame = React.useMemo(() => {
    const stored = parseStoredWordGuessGame(
      storage.get<unknown>(storageKey),
      wordLength,
      roundMode,
    )
    if (stored && stored.round.hardMode === hardMode) {
      return stored
    }
    return {
      round: createRound(wordLength, roundMode, hardMode, answerWords),
      currentGuess: "",
    }
  }, [roundMode, storage, storageKey, wordLength, hardMode, answerWords])
  const [round, setRound] = React.useState<WordGuessRoundState>(initialGame.round)
  const [draft, dispatchDraft] = React.useReducer(reduceGuessDraft, {
    guess: initialGame.currentGuess,
    column: null,
  })
  const currentGuess = draft.guess
  const selectedColumn = draft.column
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

      dispatchDraft({ type: "letter", letter: next, wordLength })
      setFeedback(null)
    },
    [isPlaying, wordLength],
  )

  const removeLetter = React.useCallback(() => {
    if (!isPlaying) {
      return
    }

    dispatchDraft({ type: "backspace" })
    setFeedback(null)
  }, [isPlaying])

  const selectColumn = React.useCallback(
    (columnIndex: number) => {
      if (!isPlaying) {
        return
      }

      dispatchDraft({ type: "select", column: columnIndex, wordLength })
      setFeedback(null)
    },
    [isPlaying, wordLength],
  )

  const moveColumn = React.useCallback(
    (direction: -1 | 1) => {
      if (!isPlaying) {
        return
      }

      dispatchDraft({ type: "move", direction, wordLength })
    },
    [isPlaying, wordLength],
  )

  const [flipRowIndex, setFlipRowIndex] = React.useState<number | null>(null)
  const [flipTrigger, setFlipTrigger] = React.useState(0)

  const submitGuess = React.useCallback(() => {
    const result = submitWordGuessGuess(round, currentGuess, guessableSet)
    if (!result.ok) {
      if (result.reason === "locked-letters-violation") {
        setFeedback("Must reuse correctly-placed letters in the same positions")
        setInvalidWordShake((prev) => ({
          rowIndex: round.guesses.length,
          trigger: (prev?.trigger ?? 0) + 1,
        }))
        return
      }
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
    setFlipRowIndex(result.round.guesses.length - 1)
    setFlipTrigger((prev) => prev + 1)
    setRound(result.round)
    dispatchDraft({ type: "clear" })
    if (result.round.status === "won") {
      setFeedback("You solved it.")
      return
    }
    if (result.round.status === "lost") {
      setFeedback("Round over.")
      return
    }

    setFeedback(null)
  }, [currentGuess, round, wordLength, guessableSet])

  const resetRound = React.useCallback(() => {
    setRound(createRound(wordLength, roundMode, hardMode, answerWords))
    dispatchDraft({ type: "clear" })
    setFeedback(null)
    setInvalidWordShake(null)
  }, [roundMode, wordLength, hardMode, answerWords])

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

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault()
        removeLetter()
        return
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        moveColumn(event.key === "ArrowLeft" ? -1 : 1)
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
  }, [addLetter, moveColumn, removeLetter, submitGuess])

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

  const guessDistribution = React.useMemo(() => {
    if (round.status !== "won") return undefined
    const dist = new Array(round.maxTries).fill(0)
    dist[round.guesses.length - 1] = 1
    return dist
  }, [round.status, round.guesses.length, round.maxTries])

  useEngagementRecorder({
    gameId: "word-guess",
    variant: String(wordLength),
    status: round.status,
    isDaily: roundMode === "daily",
    guessDistribution,
  })

  return {
    attemptsUsed,
    boardRows,
    canSubmit: isPlaying && currentGuess.length === wordLength,
    currentGuess,
    feedback,
    flipRowIndex,
    flipTrigger,
    invalidWordShake,
    isPlaying,
    keyboardStates,
    round,
    selectedColumn,
    addLetter,
    removeLetter,
    resetRound,
    selectColumn,
    submitGuess,
  }
}
