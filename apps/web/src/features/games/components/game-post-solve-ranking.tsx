"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ComparativeRankingsList } from "@/features/games/components/comparative-rankings-list"
import { usePostSolveRankings } from "@/features/games/hooks/use-post-solve-rankings"

interface PostSolveRankingProps {
  gameId: string
}

/**
 * Post-solve comparative ranking card for stats-style surfaces.
 */
export function PostSolveRanking({ gameId }: PostSolveRankingProps) {
  const rankings = usePostSolveRankings(gameId)

  if (rankings.length === 0) return null

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">How you compare</CardTitle>
      </CardHeader>
      <CardContent>
        <ComparativeRankingsList rankings={rankings} title="" />
      </CardContent>
    </Card>
  )
}
