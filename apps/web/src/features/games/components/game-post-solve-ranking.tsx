"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useStorage } from "@/infrastructure/storage"
import {
  loadCompletions,
  computeStats,
  computePercentile,
  DISTRIBUTION_DATA,
} from "@pasttime/domain/engagement"

interface PostSolveRankingProps {
  gameId: string
  gameTitle: string
}

/**
 * Post-solve comparative ranking card. Shows how the player's metrics
 * (streak, win rate, solve time) compare against the distribution of
 * other players, using stub data from DISTRIBUTION_DATA.
 *
 * Returns null when there are no completions, no distribution data,
 * or no metrics with both values and distributions.
 */
export function PostSolveRanking({
  gameId,
  gameTitle,
}: PostSolveRankingProps) {
  const storage = useStorage()
  const completions = useMemo(
    () => loadCompletions(storage, gameId),
    [storage, gameId],
  )
  const stats = useMemo(() => computeStats(completions), [completions])
  const distributions = DISTRIBUTION_DATA[gameId]

  if (!distributions) return null

  const rankings = useMemo(() => {
    const items: { label: string; percentile: number }[] = []

    if (
      stats.dailyStreak &&
      stats.dailyStreak.current > 0 &&
      distributions.streak
    ) {
      items.push({
        label: "Your streak is longer than",
        percentile: computePercentile(
          stats.dailyStreak.current,
          distributions.streak,
        ),
      })
    }

    if (
      stats.winRate !== undefined &&
      stats.winRate > 0 &&
      distributions.winRate
    ) {
      items.push({
        label: "Your win rate beats",
        percentile: computePercentile(stats.winRate, distributions.winRate),
      })
    }

    if (
      stats.averageTime !== undefined &&
      stats.averageTime !== null &&
      distributions.solveTime
    ) {
      items.push({
        label: "Your solve time is faster than",
        percentile: computePercentile(
          stats.averageTime,
          distributions.solveTime,
        ),
      })
    }

    return items
  }, [stats, distributions])

  if (rankings.length === 0) return null

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">How you compare</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankings.map((item) => (
          <p key={item.label} className="text-sm">
            {item.label}{" "}
            <span className="font-semibold">{item.percentile}%</span> of players
          </p>
        ))}
      </CardContent>
    </Card>
  )
}
