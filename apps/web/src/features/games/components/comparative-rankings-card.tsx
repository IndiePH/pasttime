"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ComparativeRanking } from "@pasttime/domain/engagement"
import { ComparativeRankingsList } from "@/features/games/components/comparative-rankings-list"

interface ComparativeRankingsCardProps {
  rankings: ComparativeRanking[]
  className?: string
}

/**
 * Anonymous percentile comparisons — always "You" vs the population, never a
 * ranked list of other players.
 */
export function ComparativeRankingsCard({
  rankings,
  className,
}: ComparativeRankingsCardProps) {
  if (rankings.length === 0) return null

  return (
    <Card className={className ?? "w-full max-w-sm"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">How you compare</CardTitle>
      </CardHeader>
      <CardContent>
        <ComparativeRankingsList rankings={rankings} title="" />
      </CardContent>
    </Card>
  )
}
