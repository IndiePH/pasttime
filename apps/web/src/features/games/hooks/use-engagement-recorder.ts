"use client"

import { useEffect, useRef } from "react"
import { useStorage } from "@/infrastructure/storage"
import {
  loadCompletions,
  addCompletion,
  saveCompletions,
  getDateString,
  type DailyCompletion,
} from "@pasttime/domain/engagement"

interface UseEngagementRecorderParams {
  /** Game ID — used as the storage key prefix (e.g. "crossword", "word-guess") */
  gameId: string
  /** Game variant — e.g. crossword size "7", word length "5", solitaire mode "klondike" */
  variant: string
  /** Current game status — the hook watches for transitions to "won" or "lost" */
  status: string | null
  /** Only record completions when the game is in daily mode */
  isDaily: boolean
  /** Optional solve time in seconds */
  time?: number
  /** Optional move count (solitaire) */
  moves?: number
  /** Optional guess distribution array (word guess) */
  guessDistribution?: number[]
}

/**
 * Records a DailyCompletion to the engagement persistence layer when a
 * daily game transitions from "playing" to "won" or "lost".
 *
 * Must be used within a StorageProvider context. Uses a ref to track the
 * previous status value so the recording fires only on transition, not on
 * every render.
 *
 * @example
 * ```tsx
 * useEngagementRecorder({
 *   gameId: "crossword",
 *   variant: String(gridSize),
 *   status: gameState.status,
 *   isDaily: mode === "daily",
 * })
 * ```
 */
export function useEngagementRecorder({
  gameId,
  variant,
  status,
  isDaily,
  time,
  moves,
  guessDistribution,
}: UseEngagementRecorderParams): void {
  const storage = useStorage()
  const prevStatusRef = useRef<string | null>(null)

  useEffect(() => {
    // Only record in daily mode
    if (!isDaily) return

    const prevStatus = prevStatusRef.current
    prevStatusRef.current = status

    // Ignore initial render and non-transitions
    if (!status || status === prevStatus) return

    // Only record terminal statuses
    if (status !== "won" && status !== "lost") return

    const completion: DailyCompletion = {
      date: getDateString(new Date()),
      game: gameId,
      variant,
      status,
      timestamp: Date.now(),
      ...(time !== undefined && { time }),
      ...(moves !== undefined && { moves }),
      ...(guessDistribution !== undefined && { guessDistribution }),
    }

    const completions = loadCompletions(storage, gameId)
    const updated = addCompletion(completions, completion)
    saveCompletions(storage, gameId, updated)
  }, [status, isDaily, gameId, variant, time, moves, guessDistribution, storage])
}
