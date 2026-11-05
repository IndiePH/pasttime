"use client"

import * as React from "react"

import {
  computeReversiStats,
  type ReversiMatch,
} from "@pasttime/domain/games/reversi"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { PlatformLink } from "@/platform/navigation"
import type { GameDefinition } from "@pasttime/domain/games"

import {
  loadReversiMatches,
} from "../hooks/use-reversi-match-history"

interface ReversiStatsViewProps {
  game: GameDefinition
}

export function ReversiStatsView({ game }: ReversiStatsViewProps) {
  const [matches, setMatches] = React.useState<ReversiMatch[]>([])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount localStorage read
    setMatches(loadReversiMatches())
  }, [])

  const stats = React.useMemo(() => computeReversiStats(matches), [matches])

  if (matches.length === 0) {
    return (
      <GamePageShell game={game}>
        <GameSessionHeader game={game} subtitle="Stats" />
        <Card className="mt-6 w-full max-w-md">
          <CardHeader>
            <CardTitle>No stats yet</CardTitle>
            <CardDescription>
              Finish a Reversi game to see your record and score margins here.
            </CardDescription>
          </CardHeader>
        </Card>
        <StatsFooter game={game} />
      </GamePageShell>
    )
  }

  return (
    <GamePageShell game={game}>
      <GameSessionHeader game={game} subtitle="Stats" />
      <div className="mt-6 w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Record</CardTitle>
            <CardDescription>Black · local computer match history</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p
              className="text-5xl font-bold tabular-nums tracking-wide"
              aria-label={`${stats.wins} wins, ${stats.losses} losses, ${stats.draws} draws`}
            >
              {stats.wins}–{stats.losses}–{stats.draws}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              W Wins · L Losses · D Draws
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatRow label="Games played" value={String(stats.totalGames)} />
            <StatRow
              label="Win rate"
              value={`${(stats.winRate * 100).toFixed(1)}%`}
            />
            <StatRow
              label="Longest win streak"
              value={String(stats.longestWinStreak)}
            />
            <StatRow
              label="Biggest win margin"
              value={formatMargin(stats.biggestWinMargin)}
            />
            <StatRow
              label="Average score margin"
              value={formatMargin(stats.averageScoreMargin, 1)}
            />
          </CardContent>
        </Card>
      </div>
      <StatsFooter game={game} />
    </GamePageShell>
  )
}

function StatsFooter({ game }: { game: GameDefinition }) {
  return (
    <GamePlayFooterActions>
      <Button variant="outline" className="w-full" asChild>
        <PlatformLink href={`/games/${game.id}/play`}>Play {game.title}</PlatformLink>
      </Button>
      <Button variant="outline" className="w-full" asChild>
        <PlatformLink href={`/games/${game.id}`}>Back To Setup</PlatformLink>
      </Button>
    </GamePlayFooterActions>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function formatMargin(value: number | null, decimals = 0): string {
  if (value === null) {
    return "—"
  }
  const formatted = value.toFixed(decimals)
  return value > 0 ? `+${formatted}` : formatted
}
