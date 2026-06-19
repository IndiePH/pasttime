"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useStorage } from "@/infrastructure/storage"
import type {
  CrosswordCell,
  CrosswordGameState,
  CrosswordGridSize,
  CrosswordRoundMode,
} from "@pasttime/domain/games/crossword"
import {
  createCrosswordGameState,
  getCellKey,
  isCellFilled,
  resolveCrosswordStatus,
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

  // Persist on every state change (like klondike).
  useEffect(() => {
    storage.set(storageKey, gameState)
  }, [gameState, storage, storageKey])

  const newPuzzle = useCallback(() => {
    storage.remove(storageKey)
    const next = createCrosswordGameState(size, mode)
    setGameState(next)
  }, [size, mode, storage, storageKey])

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
    },
    [],
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

  return {
    gameState,
    newPuzzle,
    updateInput,
    recheckStatus,
    blocks,
    setActiveCell,
  }
}

// Re-export for the grid component's type usage.
export type { CrosswordCell }
