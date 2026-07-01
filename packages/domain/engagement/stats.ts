import type { DailyCompletion, StatsSnapshot } from "./types"
import { computeStreak } from "./streak"

/**
 * Compute per-game stats from daily completion records.
 *
 * Returns a StatsSnapshot with fields populated based on available data:
 * - All games: totalSolves, winRate, dailyStreak
 * - Crossword: averageTime (if time data present)
 * - Solitaire: totalGames, totalWins, lowestMovesOnWin, highestMovesOnWin, averageMovesOnWin
 * - Word Guess: guessDistribution aggregated across won completions
 *
 * @param completions - Array of DailyCompletion records (enriched or not)
 * @returns StatsSnapshot with available fields set, others undefined
 */
export function computeStats(completions: DailyCompletion[]): StatsSnapshot {
  if (completions.length === 0) {
    return {}
  }

  const solved = completions.filter((c) => c.status === "won")
  const totalSolves = solved.length
  const totalCompletions = completions.length
  const winRate = totalCompletions > 0 ? totalSolves / totalCompletions : 0

  // Average time from won completions that have time data
  const times = solved
    .map((c) => c.time)
    .filter((t): t is number => t !== undefined && t !== null)
  const averageTime =
    times.length > 0
      ? times.reduce((sum, t) => sum + t, 0) / times.length
      : null

  // Solitaire: moves data from won completions
  const moves = solved
    .map((c) => c.moves)
    .filter((m): m is number => m !== undefined && m !== null)
  const lowestMovesOnWin = moves.length > 0 ? Math.min(...moves) : undefined
  const highestMovesOnWin = moves.length > 0 ? Math.max(...moves) : undefined
  const averageMovesOnWin =
    moves.length > 0
      ? Math.round((moves.reduce((sum, m) => sum + m, 0) / moves.length) * 10) / 10
      : undefined

  // Word Guess: aggregate guess distribution across won completions
  // guessDistribution is an array where index 0 = solves in 1 try, index 1 = solves in 2 tries, etc.
  const distributions = solved
    .map((c) => c.guessDistribution)
    .filter((d): d is number[] => d !== undefined && d !== null)
  const guessDistribution =
    distributions.length > 0 ? aggregateDistributions(distributions) : undefined

  // Streak
  const dailyStreak = computeStreak(completions)

  return {
    totalSolves,
    totalGames: totalCompletions,
    totalWins: totalSolves,
    winRate: Math.round(winRate * 1000) / 1000, // 3 decimal places
    averageTime,
    lowestMovesOnWin,
    highestMovesOnWin,
    averageMovesOnWin,
    guessDistribution,
    dailyStreak,
    comparativeRankings: undefined, // Populated in Phase 8
  }
}

/**
 * Aggregate multiple guess distributions into one.
 * Each distribution is an array where index i = number of solves in (i+1) tries.
 * Returns a single distribution summing across all input distributions.
 */
function aggregateDistributions(distributions: number[][]): number[] {
  const maxLen = Math.max(...distributions.map((d) => d.length), 0)
  const result = new Array(maxLen).fill(0)
  for (const dist of distributions) {
    for (let i = 0; i < dist.length; i++) {
      result[i] += dist[i]
    }
  }
  return result
}
