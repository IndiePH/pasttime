"use client"

import * as React from "react"
import { PlatformLink } from "@/platform/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import { gameLaunchPath, gamePlayPath } from "@pasttime/domain/games"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import {
  loadCompletions,
  computeStats,
  computeComparativeRankings,
} from "@pasttime/domain/engagement"
import { useStorage } from "@/infrastructure/storage"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { ComparativeRankingsCard } from "@/features/games/components/comparative-rankings-card"

export interface GameStatsViewProps {
  game: GameDefinition
}

/**
 * Shared stats page component. Loads daily completions from the engagement
 * persistence layer, computes stats via `computeStats`, and renders a
 * game-agnostic stats display.
 *
 * Gracefully handles empty state (no completions yet) by showing a prompt
 * to play the game.
 */
export function GameStatsView({ game }: GameStatsViewProps) {
  const storage = useStorage()
  const [completions, setCompletions] = React.useState<ReturnType<typeof loadCompletions>>([])

  // SSR-safe external-store read: storage is unavailable during SSR, so we
  // read after mount. loadCompletions returns a fresh array, so it can't be
  // a useSyncExternalStore snapshot without a caching layer; snapshot caching
  // is a separate refactor.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount external store read
    setCompletions(loadCompletions(storage, game.id))
  }, [storage, game.id])

  const stats = React.useMemo(() => computeStats(completions), [completions])
  const comparativeRankings = React.useMemo(
    () => computeComparativeRankings(game.id, stats),
    [game.id, stats],
  )

  if (completions.length === 0) {
    return (
      <GamePageShell>
        <GameSessionHeader game={game} subtitle="Stats" />
        <Card className="mt-6 w-full max-w-xs">
          <CardHeader>
            <CardTitle>No stats yet</CardTitle>
            <CardDescription>
              Play some {game.title} games to see your stats here.
            </CardDescription>
          </CardHeader>
        </Card>
        <GamePlayFooterActions>
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={gamePlayPath(game.id)}>
              Play {game.title}
            </PlatformLink>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={gameLaunchPath(game.id)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      </GamePageShell>
    )
  }

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle="Stats" />
      <div className="mt-6 w-full max-w-md space-y-4">
        {/* Streak card */}
        {stats.dailyStreak && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {stats.dailyStreak.current}
                  </p>
                  <p className="text-sm text-muted-foreground">Current</p>
                </div>
                <div>
                  <p className="text-3xl font-bold tabular-nums">
                    {stats.dailyStreak.longest}
                  </p>
                  <p className="text-sm text-muted-foreground">Longest</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats overview card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatRow
              label="Solves"
              value={String(stats.totalSolves ?? "—")}
            />
            {stats.totalGames !== undefined && (
              <StatRow
                label="Games played"
                value={String(stats.totalGames)}
              />
            )}
            {stats.winRate !== undefined && (
              <StatRow
                label="Win rate"
                value={`${(stats.winRate * 100).toFixed(1)}%`}
              />
            )}
            {stats.averageTime !== undefined && stats.averageTime !== null && (
              <StatRow
                label="Avg time"
                value={formatDuration(stats.averageTime)}
              />
            )}
            {stats.lowestMovesOnWin !== undefined && (
              <StatRow
                label="Best moves"
                value={String(stats.lowestMovesOnWin)}
              />
            )}
            {stats.averageMovesOnWin !== undefined && (
              <StatRow
                label="Avg moves"
                value={String(stats.averageMovesOnWin)}
              />
            )}
          </CardContent>
        </Card>

        {/* Guess distribution card (word guess) */}
        {stats.guessDistribution && stats.guessDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Guess Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {stats.guessDistribution.map((count, i) => {
                const maxCount = Math.max(...stats.guessDistribution!, 1)
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <div
                        className="h-5 min-w-[1.25rem] rounded-r bg-primary transition-all"
                        style={{
                          width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%`,
                        }}
                      />
                      <span className="text-xs font-medium tabular-nums">
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        <ComparativeRankingsCard
          rankings={comparativeRankings}
          className="w-full max-w-md"
        />
      </div>

      <GamePlayFooterActions>
        <Button variant="outline" className="w-full" asChild>
          <PlatformLink href={gamePlayPath(game.id)}>
            Play {game.title}
          </PlatformLink>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <PlatformLink href={gameLaunchPath(game.id)}>
            Back to setup
          </PlatformLink>
        </Button>
      </GamePlayFooterActions>
    </GamePageShell>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  )
}

/**
 * Format a duration in seconds to "Xm Ys".
 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}
