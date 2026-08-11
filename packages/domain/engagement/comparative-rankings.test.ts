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
})
