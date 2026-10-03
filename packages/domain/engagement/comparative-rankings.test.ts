import { describe, expect, it } from "vitest"

import { computeComparativeRankings } from "./comparative-rankings"
import type { StatsSnapshot } from "./types"

describe("computeComparativeRankings", () => {
  it("returns streak and win rate for word guess", () => {
    const stats: StatsSnapshot = {
      winRate: 0.8,
      dailyStreak: { current: 5, longest: 10 },
    }

    const rankings = computeComparativeRankings("word-guess", stats)

    expect(rankings).toHaveLength(2)
    expect(rankings[0]?.metric).toBe("streak")
    expect(rankings[1]?.metric).toBe("winRate")
    expect(rankings.every((r) => r.percentile >= 0 && r.percentile <= 100)).toBe(
      true,
    )
  })

  it("treats lower solve times as better", () => {
    const fast: StatsSnapshot = {
      averageTime: 120,
      dailyStreak: { current: 1, longest: 1 },
      winRate: 1,
    }
    const slow: StatsSnapshot = {
      averageTime: 900,
      dailyStreak: { current: 1, longest: 1 },
      winRate: 1,
    }

    const fastRank = computeComparativeRankings("crossword", fast).find(
      (r) => r.metric === "solveTime",
    )
    const slowRank = computeComparativeRankings("crossword", slow).find(
      (r) => r.metric === "solveTime",
    )

    expect(fastRank).toBeDefined()
    expect(slowRank).toBeDefined()
    expect(fastRank!.percentile).toBeGreaterThan(slowRank!.percentile)
  })

  it("returns empty for unknown games", () => {
    expect(computeComparativeRankings("unknown", {})).toEqual([])
  })

  it("ranks fewer word-guess tries above more tries", () => {
    const stats: StatsSnapshot = {
      winRate: 0.8,
      dailyStreak: { current: 5, longest: 10 },
    }

    const fewer = computeComparativeRankings("word-guess", stats, {
      tries: 2,
    }).find((ranking) => ranking.metric === "tries")
    const more = computeComparativeRankings("word-guess", stats, {
      tries: 6,
    }).find((ranking) => ranking.metric === "tries")

    expect(fewer).toMatchObject({
      metric: "tries",
      label: "Your guess count beats",
    })
    expect(more).toBeDefined()
    expect(fewer!.percentile).toBeGreaterThan(more!.percentile)
  })

  it("omits the tries line when this solve has no try count", () => {
    const stats: StatsSnapshot = {
      winRate: 0.8,
      dailyStreak: { current: 5, longest: 10 },
    }

    const rankings = computeComparativeRankings("word-guess", stats)

    expect(rankings.map((ranking) => ranking.metric)).toEqual([
      "streak",
      "winRate",
    ])
  })

  it("leaves other games unchanged when a try count is supplied", () => {
    const stats: StatsSnapshot = {
      winRate: 1,
      averageTime: 300,
      lowestMovesOnWin: 80,
      dailyStreak: { current: 3, longest: 3 },
    }

    for (const gameId of ["crossword", "solitaire", "sudoku"]) {
      expect(computeComparativeRankings(gameId, stats, { tries: 2 })).toEqual(
        computeComparativeRankings(gameId, stats),
      )
    }
  })
})
