"use client"

import { useMemo } from "react"
import {
  loadCompletions,
  computeStats,
  computeComparativeRankings,
} from "@pasttime/domain/engagement"
import { useStorage } from "@/infrastructure/storage"

export function usePostSolveRankings(gameId: string, refreshKey?: unknown) {
  const storage = useStorage()
  // refreshKey re-reads storage after a completion write. The writer runs in
  // an earlier effect; the dialog passes its open flag on the next render.
  const completions = useMemo(
    () => loadCompletions(storage, gameId),
    [storage, gameId, refreshKey],
  )
  const stats = useMemo(() => computeStats(completions), [completions])
  return useMemo(
    () => computeComparativeRankings(gameId, stats),
    [gameId, stats],
  )
}
