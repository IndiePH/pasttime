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
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [preferredDirection, setDirection] =
    useState<CrosswordDirection>("across")

  useEffect(() => {
    let cancelled = false

    const stored = storage.get<unknown>(storageKey)
    if (isCrosswordGameState(stored)) {
      queueMicrotask(() => {
        if (cancelled) return
        setGameState(stored)
        setLoadedKey(storageKey)
        setLoadError(null)
      })
      return () => {
        cancelled = true
      }
    }

    void createHydratedCrosswordGameState(size, mode)
      .then((state) => {
        if (cancelled) return
        setGameState(state)
        setLoadedKey(storageKey)
        setLoadError(null)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setLoadedKey(null)
        setLoadError(
          cause instanceof Error ? cause.message : "Failed to load crossword",
        )
      })

    return () => {
      cancelled = true
    }
  }, [size, mode, storageKey, retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const [dailyRolloverDetected] = useState(false)

  useEffect(() => {
    if (mode === "daily" && gameState) {
      storage.set(storageKey, gameState)
    }
  }, [gameState, storageKey, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const puzzle = gameState?.puzzle
  const activeCell = gameState?.activeCell

  const direction = useMemo(() => {
    if (!puzzle || !activeCell) return preferredDirection
    return resolveDirection(puzzle, activeCell, preferredDirection)
  }, [puzzle, activeCell, preferredDirection])

  const activeClue = useMemo(() => {
    if (!puzzle || !activeCell) return null
    return findClueAtCell(puzzle, activeCell, direction)
  }, [puzzle, activeCell, direction])

  const isStale = loadedKey !== storageKey
  const loadStatus: LoadStatus = loadError
    ? "error"
    : isStale || gameState === null
      ? "loading"
      : "ready"

  const retryLoad = useCallback(() => {
    setLoadedKey(null)
    setLoadError(null)
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
    setLoadedKey(null)
    setLoadError(null)
    void createHydratedCrosswordGameState(size, "random")
      .then((state) => {
        setGameState(state)
        setLoadedKey(storageKey)
        setLoadError(null)
      })
      .catch((cause: unknown) => {
        setLoadedKey(null)
        setLoadError(
          cause instanceof Error ? cause.message : "Failed to load crossword",
        )
      })
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
    gameState: isStale ? null : gameState,
    loadStatus,
    loadError,
    retryLoad,
    newPuzzle,
    updateInput,
    recheckStatus,
    blocks: isStale ? [] : blocks,
    setActiveCell,
    direction,
    setDirection,
    activeClue: isStale ? null : activeClue,
    dailyRolloverDetected,
  }
}

export type { CrosswordCell }
