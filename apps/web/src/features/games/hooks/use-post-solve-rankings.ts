"use client"

import { useMemo } from "react"
import {
  loadCompletions,
  computeStats,
  computeComparativeRankings,
} from "@pasttime/domain/engagement"
import { useStorage } from "@/infrastructure/storage"

export function usePostSolveRankings(gameId: string) {
  const storage = useStorage()
  const completions = useMemo(
    () => loadCompletions(storage, gameId),
    [storage, gameId],
  )
  const stats = useMemo(() => computeStats(completions), [completions])
  return useMemo(
    () => computeComparativeRankings(gameId, stats),
    [gameId, stats],
  )
}
