"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { useStorage } from "@/infrastructure/storage"
import { getDailySeed } from "@pasttime/domain/daily"
import {
  clearSudokuCell,
  createSudokuGame,
  getSudokuStorageKey,
  parseStoredSudokuGame,
  placeSudokuDigit,
  selectSudokuCell,
  setSudokuAutoCandidates,
  setSudokuCandidateMode,
  toggleSudokuCandidate,
  undoSudoku,
  type SudokuDifficulty,
  type SudokuDigit,
  type SudokuGameState,
  type SudokuRoundMode,
} from "@pasttime/domain/games/sudoku"

import { generateSudokuInWorker } from "../lib/generate-sudoku.client"

type SudokuLoadStatus = "loading" | "ready" | "error"

/** Cryptographically-sourced uint32 seed for endless/random rounds. */
function randomSudokuSeed(): number {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0]
}

/**
 * Applies a domain mutation and reconciles the live timer:
 * - while playing (including a playing -> won/abandoned transition): flush
 *   the segment since `startedAt` into `elapsedMs` and refresh `startedAt`
 *   to `now`. This runs on *every* mutation, not just status transitions, so
 *   `elapsedMs` in the persisted state is always an accurate "already played"
 *   base — a later hydrate only ever loses the (typically tiny) gap between
 *   the last mutation and the tab closing, never the whole session.
 * - won/abandoned -> playing (e.g. undo after a win): start a fresh segment
 *   from `now`, keeping the already-accumulated `elapsedMs`.
 */
function applySudokuMutation(
  state: SudokuGameState,
  mutate: (state: SudokuGameState) => SudokuGameState,
): SudokuGameState {
  const next = mutate(state)
  if (next === state) return state

  const now = Date.now()
  if (state.status === "playing") {
    return { ...next, elapsedMs: next.elapsedMs + (now - state.startedAt), startedAt: now }
  }
  if (next.status === "playing") {
    return { ...next, startedAt: now }
  }
  return next
}

export function useSudokuGame(difficulty: SudokuDifficulty, mode: SudokuRoundMode) {
  const storage = useStorage()
  const storageKey = useMemo(
    () => getSudokuStorageKey(difficulty, mode),
    [difficulty, mode],
  )

  const [state, setState] = useState<SudokuGameState | null>(null)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    let cancelled = false

    const stored = parseStoredSudokuGame(storage.get<unknown>(storageKey), difficulty, mode)
    if (stored) {
      queueMicrotask(() => {
        if (cancelled) return
        setState(stored)
        setLoadedKey(storageKey)
        setError(null)
      })
      return () => {
        cancelled = true
      }
    }

    const seed = mode === "daily" ? getDailySeed(new Date()) : randomSudokuSeed()

    void generateSudokuInWorker(difficulty, seed)
      .then((puzzle) => {
        if (cancelled) return
        setState(createSudokuGame(puzzle, mode))
        setLoadedKey(storageKey)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setLoadedKey(null)
        setError(
          cause instanceof Error ? cause.message : "Failed to generate sudoku puzzle",
        )
      })

    return () => {
      cancelled = true
    }
  }, [difficulty, mode, storageKey, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist on every state change — both daily AND random modes resume,
  // unlike crossword's ephemeral endless mode. Guarded on `loadedKey` so a
  // stale `state` from the previous difficulty/mode never gets written under
  // the new `storageKey` during the brief window before the load effect
  // above replaces it (a bug crossword's analogous effect doesn't guard against).
  useEffect(() => {
    if (!state || loadedKey !== storageKey) return
    storage.set(storageKey, state)
  }, [state, storageKey, loadedKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Derive the live elapsed clock and tick once a second while playing.
  // `Date.now()` is read inside this callback (never during render), and the
  // resulting setState calls are routed through a named helper so they read
  // as subscription updates rather than a direct render-derived assignment.
  useEffect(() => {
    function syncElapsed() {
      if (!state) {
        setElapsedMs(0)
        return
      }
      setElapsedMs(
        state.status === "playing"
          ? state.elapsedMs + (Date.now() - state.startedAt)
          : state.elapsedMs,
      )
    }

    syncElapsed()
    if (!state || state.status !== "playing") return
    const interval = setInterval(syncElapsed, 1000)
    return () => clearInterval(interval)
  }, [state])

  const retry = useCallback(() => {
    setLoadedKey(null)
    setError(null)
    setRetryCount((count) => count + 1)
  }, [])

  const selectCell = useCallback((index: number) => {
    setState((prev) =>
      prev ? applySudokuMutation(prev, (s) => selectSudokuCell(s, index)) : prev,
    )
  }, [])

  const placeDigit = useCallback((digit: SudokuDigit) => {
    setState((prev) => {
      if (!prev) return prev
      const mutate = prev.candidateMode
        ? (s: SudokuGameState) => toggleSudokuCandidate(s, digit)
        : (s: SudokuGameState) => placeSudokuDigit(s, digit)
      return applySudokuMutation(prev, mutate)
    })
  }, [])

  const clearCell = useCallback(() => {
    setState((prev) => (prev ? applySudokuMutation(prev, clearSudokuCell) : prev))
  }, [])

  const toggleCandidateMode = useCallback(() => {
    setState((prev) =>
      prev
        ? applySudokuMutation(prev, (s) => setSudokuCandidateMode(s, !s.candidateMode))
        : prev,
    )
  }, [])

  const setAutoCandidates = useCallback((on: boolean) => {
    setState((prev) =>
      prev ? applySudokuMutation(prev, (s) => setSudokuAutoCandidates(s, on)) : prev,
    )
  }, [])

  const undo = useCallback(() => {
    setState((prev) => (prev ? applySudokuMutation(prev, undoSudoku) : prev))
  }, [])

  const isStale = loadedKey !== storageKey
  const status: SudokuLoadStatus = error
    ? "error"
    : isStale || state === null
      ? "loading"
      : "ready"

  const visibleState = isStale ? null : state

  useEngagementRecorder({
    gameId: "sudoku",
    variant: difficulty,
    status: visibleState?.status ?? "playing",
    isDaily: mode === "daily",
    time: Math.floor(elapsedMs / 1000),
  })

  return {
    status,
    state: visibleState,
    error,
    retry,
    selectCell,
    placeDigit,
    clearCell,
    toggleCandidateMode,
    setAutoCandidates,
    undo,
    elapsedMs,
  }
}
