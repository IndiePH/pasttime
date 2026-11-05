import { describe, expect, it } from "vitest"

import { computeReversiStats, type ReversiMatch } from "./index"

const matches: ReversiMatch[] = [
  { blackScore: 42, whiteScore: 22, result: "win", timestamp: 1 },
  { blackScore: 31, whiteScore: 33, result: "loss", timestamp: 2 },
  { blackScore: 38, whiteScore: 26, result: "win", timestamp: 3 },
  { blackScore: 32, whiteScore: 32, result: "draw", timestamp: 4 },
  { blackScore: 40, whiteScore: 24, result: "win", timestamp: 5 },
]

describe("computeReversiStats", () => {
  it("computes the boxing-style record and score metrics", () => {
    expect(computeReversiStats(matches)).toEqual({
      wins: 3,
      losses: 1,
      draws: 1,
      totalGames: 5,
      winRate: 0.6,
      longestWinStreak: 1,
      biggestWinMargin: 20,
      averageScoreMargin: 9.2,
    })
  })

  it("orders matches by timestamp before computing the win streak", () => {
    const outOfOrder = [matches[2]!, matches[0]!]

    expect(computeReversiStats(outOfOrder).longestWinStreak).toBe(2)
  })

  it("returns zero and null values without completed matches", () => {
    expect(computeReversiStats([])).toEqual({
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winRate: 0,
      longestWinStreak: 0,
      biggestWinMargin: null,
      averageScoreMargin: null,
    })
  })
})
