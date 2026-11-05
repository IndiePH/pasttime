import type { ReversiMatch, ReversiStats } from "./types"

export function computeReversiStats(matches: readonly ReversiMatch[]): ReversiStats {
  const orderedMatches = [...matches].sort(
    (a, b) => a.timestamp - b.timestamp,
  )
  const wins = orderedMatches.filter((match) => match.result === "win").length
  const losses = orderedMatches.filter((match) => match.result === "loss").length
  const draws = orderedMatches.filter((match) => match.result === "draw").length
  const totalGames = orderedMatches.length
  const margins = orderedMatches.map(
    (match) => match.blackScore - match.whiteScore,
  )
  const winningMargins = orderedMatches
    .filter((match) => match.result === "win")
    .map((match) => match.blackScore - match.whiteScore)

  let currentWinStreak = 0
  let longestWinStreak = 0
  for (const match of orderedMatches) {
    if (match.result === "win") {
      currentWinStreak += 1
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak)
    } else {
      currentWinStreak = 0
    }
  }

  return {
    wins,
    losses,
    draws,
    totalGames,
    winRate: totalGames === 0 ? 0 : Math.round((wins / totalGames) * 1000) / 1000,
    longestWinStreak,
    biggestWinMargin:
      winningMargins.length > 0 ? Math.max(...winningMargins) : null,
    averageScoreMargin:
      margins.length > 0
        ? Math.round(
            (margins.reduce((sum, margin) => sum + margin, 0) /
              margins.length) *
              10,
          ) / 10
        : null,
  }
}
