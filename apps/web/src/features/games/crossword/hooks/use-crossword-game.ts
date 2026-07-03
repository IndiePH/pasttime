"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { useStorage } from "@/infrastructure/storage"
import type {
  CrosswordCell,
  CrosswordClue,
  CrosswordDirection,
  CrosswordGameState,
  CrosswordGridSize,
  CrosswordRoundMode,
} from "@pasttime/domain/games/crossword"
import { isNewDay } from "@pasttime/domain/daily"
import {
  createCrosswordGameState,
  findClueAtCell,
  getCellKey,
  isCellFilled,
  resolveCrosswordStatus,
  resolveDirection,
} from "@pasttime/domain/games/crossword"

const CROSSWORD_STORAGE_KEY = (
  size: CrosswordGridSize,
  mode: CrosswordRoundMode,
) => `crossword:${size}:${mode}`

const VALID_STATUSES = new Set(["playing", "won", "lost", "abandoned"])

function isCrosswordGameState(value: unknown): value is CrosswordGameState {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  const puzzle = record.puzzle
  if (!puzzle || typeof puzzle !== "object" || !("grid" in puzzle)) return false
  if (typeof record.inputs !== "object") return false
  if (!VALID_STATUSES.has(record.status as string)) return false
  return true
}

export function useCrosswordGame(
  size: CrosswordGridSize,
  mode: CrosswordRoundMode,
) {
  const storage = useStorage()
  const storageKey = useMemo(
    () => CROSSWORD_STORAGE_KEY(size, mode),
    [size, mode],
  )

  // Synchronous initialisation — mirrors klondike. localStorage reads are
  // synchronous so there is no loading gate needed.
  const initialState = useMemo(() => {
    const stored = storage.get<unknown>(storageKey)
    return isCrosswordGameState(stored)
      ? stored
      : createCrosswordGameState(size, mode)
  }, [storageKey, size, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const [gameState, setGameState] = useState<CrosswordGameState>(initialState)

  // Ephemeral direction state — re-derived on reload (D-09). Lazy-initialises
  // across-first from the persisted activeCell (D-03).
  const [direction, setDirection] = useState<CrosswordDirection>(() =>
    gameState.activeCell
      ? resolveDirection(gameState.puzzle, gameState.activeCell, "across")
      : "across",
  )

  // Track daily-rollover: false on initial mount (the current session is valid).
  // The play view polls or checks on focus to detect rollover and show the banner.
  const [dailyRolloverDetected, setDailyRolloverDetected] = useState(false)

  // Persist on every state change for daily mode only (D-16).
  // Endless mode is ephemeral — no state written to storage.
  useEffect(() => {
    if (mode === "daily") {
      storage.set(storageKey, gameState)
    }
  }, [gameState, storage, storageKey, mode])

  // Derived activeClue — never persisted, recomputed on every render (D-09).
  const activeClue = useMemo(() => {
    if (!gameState.activeCell) return null
    return findClueAtCell(gameState.puzzle, gameState.activeCell, direction)
  }, [gameState.puzzle, gameState.activeCell, direction])

  const newPuzzle = useCallback(() => {
    if (mode === "daily") {
      // Daily mode: reset inputs but keep the same puzzle (D-14).
      // The puzzle is deterministic from the date seed so it stays the same.
      setGameState((prev) => ({
        ...prev,
        inputs: {},
        status: "playing" as const,
      }))
    } else {
      // Endless mode: generate a fresh random puzzle with a new seed (D-14).
      storage.remove(storageKey)
      const next = createCrosswordGameState(size, "random")
      setGameState(next)
    }
  }, [mode, size, storage, storageKey])

  const updateInput = useCallback(
    (row: number, col: number, value: string) => {
      setGameState((prev) => {
        if (!isCellFilled(prev.puzzle, row, col)) return prev

        const cellKey = getCellKey(row, col)
        const newInputs = { ...prev.inputs }
        if (value) {
          newInputs[cellKey] = value.toUpperCase()
        } else {
          delete newInputs[cellKey]
        }

        return { ...prev, inputs: newInputs, status: resolveCrosswordStatus(prev.puzzle, newInputs, prev.status) }
      })
    },
    [],
  )

  const recheckStatus = useCallback(() => {
    setGameState((prev) => {
      const next = resolveCrosswordStatus(prev.puzzle, prev.inputs, prev.status)
      return next === prev.status ? prev : { ...prev, status: next }
    })
  }, [])

  const setActiveCell = useCallback(
    (cell: { row: number; col: number } | null) => {
      setGameState((prev) => ({
        ...prev,
        activeCell: cell ?? undefined,
      }))
      if (cell) {
        setDirection((d) => resolveDirection(gameState.puzzle, cell, d))
      }
    },
    [gameState.puzzle],
  )

  const blocks = gameState
    ? gameState.puzzle.grid.flatMap((row, r) =>
        row
          .map((cell, c) =>
            cell.type === "block" ? { row: r, col: c } : null,
          )
          .filter((x): x is { row: number; col: number } => x !== null),
      )
    : []

  // Record daily completions for engagement tracking
  useEngagementRecorder({
    gameId: "crossword",
    variant: String(size),
    status: gameState.status,
    isDaily: mode === "daily",
  })

  return {
    gameState,
    newPuzzle,
    updateInput,
    recheckStatus,
    blocks,
    setActiveCell,
    direction,
    setDirection,
    activeClue,
    dailyRolloverDetected,
  }
}

// Re-export for the grid component's type usage.
export type { CrosswordCell }
