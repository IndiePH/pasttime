"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { createHydratedCrosswordGameState } from "@/lib/lexicon/crossword-state"
import { useStorage } from "@/infrastructure/storage"
import type {
  CrosswordCell,
  CrosswordDirection,
  CrosswordGameState,
  CrosswordGridSize,
  CrosswordRoundMode,
} from "@pasttime/domain/games/crossword"
import {
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

type LoadStatus = "loading" | "ready" | "error"

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

  const [gameState, setGameState] = useState<CrosswordGameState | null>(null)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadStatus("loading")
    setLoadError(null)

    const stored = storage.get<unknown>(storageKey)
    if (isCrosswordGameState(stored)) {
      setGameState(stored)
      setLoadStatus("ready")
      return () => {
        cancelled = true
      }
    }

    void createHydratedCrosswordGameState(size, mode)
      .then((state) => {
        if (cancelled) return
        setGameState(state)
        setLoadStatus("ready")
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setLoadStatus("error")
        setLoadError(
          cause instanceof Error ? cause.message : "Failed to load crossword",
        )
      })

    return () => {
      cancelled = true
    }
  }, [size, mode, storageKey, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const [direction, setDirection] = useState<CrosswordDirection>("across")

  const [dailyRolloverDetected] = useState(false)

  useEffect(() => {
    if (mode === "daily" && gameState) {
      storage.set(storageKey, gameState)
    }
  }, [gameState, storageKey, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!gameState?.activeCell) return
    setDirection((current) =>
      resolveDirection(gameState.puzzle, gameState.activeCell!, current),
    )
  }, [gameState?.activeCell, gameState?.puzzle])

  const activeClue = useMemo(() => {
    if (!gameState?.activeCell) return null
    return findClueAtCell(gameState.puzzle, gameState.activeCell, direction)
  }, [gameState?.puzzle, gameState?.activeCell, direction])

  const retryLoad = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  const newPuzzle = useCallback(() => {
    if (!gameState) return

    if (mode === "daily") {
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              inputs: {},
              status: "playing" as const,
            }
          : prev,
      )
      return
    }

    storage.remove(storageKey)
    void createHydratedCrosswordGameState(size, "random").then(setGameState)
  }, [gameState, mode, size, storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateInput = useCallback(
    (row: number, col: number, value: string) => {
      setGameState((prev) => {
        if (!prev || !isCellFilled(prev.puzzle, row, col)) return prev

        const cellKey = getCellKey(row, col)
        const newInputs = { ...prev.inputs }
        if (value) {
          newInputs[cellKey] = value.toUpperCase()
        } else {
          delete newInputs[cellKey]
        }

        return {
          ...prev,
          inputs: newInputs,
          status: resolveCrosswordStatus(prev.puzzle, newInputs, prev.status),
        }
      })
    },
    [],
  )

  const recheckStatus = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev
      const next = resolveCrosswordStatus(prev.puzzle, prev.inputs, prev.status)
      return next === prev.status ? prev : { ...prev, status: next }
    })
  }, [])

  const setActiveCell = useCallback(
    (cell: { row: number; col: number } | null) => {
      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          activeCell: cell ?? undefined,
        }
      })
    },
    [],
  )

  const blocks =
    gameState?.puzzle.grid.flatMap((row, r) =>
      row
        .map((cell, c) => (cell.type === "block" ? { row: r, col: c } : null))
        .filter((x): x is { row: number; col: number } => x !== null),
    ) ?? []

  useEngagementRecorder({
    gameId: "crossword",
    variant: String(size),
    status: gameState?.status ?? "playing",
    isDaily: mode === "daily",
  })

  return {
    gameState,
    loadStatus,
    loadError,
    retryLoad,
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

export type { CrosswordCell }
