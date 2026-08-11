import { DISTRIBUTION_DATA } from "./distribution-data"
import { computePercentile } from "./stats"
import type { ComparativeRanking, StatsSnapshot } from "./types"

type MetricDirection = "higher" | "lower"

type MetricSpec = {
  metric: string
  label: string
  direction: MetricDirection
  getValue: (stats: StatsSnapshot) => number | null | undefined
}

const GAME_METRICS: Record<string, MetricSpec[]> = {
  crossword: [
    {
      metric: "streak",
      label: "Your streak is longer than",
      direction: "higher",
      getValue: (stats) =>
        stats.dailyStreak && stats.dailyStreak.current > 0
          ? stats.dailyStreak.current
          : null,
    },
    {
      metric: "winRate",
      label: "Your win rate beats",
      direction: "higher",
      getValue: (stats) =>
        stats.winRate !== undefined && stats.winRate > 0
          ? stats.winRate
          : null,
    },
    {
      metric: "solveTime",
      label: "Your solve time is faster than",
      direction: "lower",
      getValue: (stats) =>
        stats.averageTime !== undefined && stats.averageTime !== null
          ? stats.averageTime
          : null,
    },
  ],
  solitaire: [
    {
      metric: "winRate",
      label: "Your win rate beats",
      direction: "higher",
      getValue: (stats) =>
        stats.winRate !== undefined && stats.winRate > 0
          ? stats.winRate
          : null,
    },
    {
      metric: "moves",
      label: "Your best win used fewer moves than",
      direction: "lower",
      getValue: (stats) => stats.lowestMovesOnWin,
    },
  ],
  "word-guess": [
    {
      metric: "streak",
      label: "Your streak is longer than",
      direction: "higher",
      getValue: (stats) =>
        stats.dailyStreak && stats.dailyStreak.current > 0
          ? stats.dailyStreak.current
          : null,
    },
    {
      metric: "winRate",
      label: "Your win rate beats",
      direction: "higher",
      getValue: (stats) =>
        stats.winRate !== undefined && stats.winRate > 0
          ? stats.winRate
          : null,
    },
  ],
  sudoku: [
    {
      metric: "streak",
      label: "Your streak is longer than",
      direction: "higher",
      getValue: (stats) =>
        stats.dailyStreak && stats.dailyStreak.current > 0
          ? stats.dailyStreak.current
          : null,
    },
    {
      metric: "winRate",
      label: "Your win rate beats",
      direction: "higher",
      getValue: (stats) =>
        stats.winRate !== undefined && stats.winRate > 0
          ? stats.winRate
          : null,
    },
    {
      metric: "solveTime",
      label: "Your solve time is faster than",
      direction: "lower",
      getValue: (stats) =>
        stats.averageTime !== undefined && stats.averageTime !== null
          ? stats.averageTime
          : null,
    },
  ],
}

function percentileForDirection(
  playerValue: number,
  distribution: number[],
  direction: MetricDirection,
): number {
  if (direction === "higher") {
    return computePercentile(playerValue, distribution)
  }

  if (distribution.length === 0) {
    return 50
  }

  let count = 0
  for (const value of distribution) {
    if (value >= playerValue) {
      count++
    }
  }

  return Math.round((count / distribution.length) * 100)
}

/**
 * Build anonymous comparative rankings for a game from stats and bundled
 * distribution data. Returns empty when no metrics qualify.
 */
export function computeComparativeRankings(
  gameId: string,
  stats: StatsSnapshot,
): ComparativeRanking[] {
  const specs = GAME_METRICS[gameId]
  const distributions = DISTRIBUTION_DATA[gameId]
  if (!specs || !distributions) {
    return []
  }

  const rankings: ComparativeRanking[] = []

  for (const spec of specs) {
    const value = spec.getValue(stats)
    const distribution = distributions[spec.metric]
    if (value === null || value === undefined || !distribution) {
      continue
    }

    rankings.push({
      metric: spec.metric,
      label: spec.label,
      percentile: percentileForDirection(value, distribution, spec.direction),
    })
  }

  return rankings
}
