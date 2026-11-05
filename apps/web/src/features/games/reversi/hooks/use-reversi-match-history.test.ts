import { beforeEach, describe, expect, it } from "vitest"

import {
  REVERSI_MATCH_HISTORY_KEY,
  loadReversiMatches,
  recordReversiMatch,
} from "./use-reversi-match-history"

describe("Reversi match history", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("records every completed match under the Reversi history key", () => {
    const first = {
      blackScore: 38,
      whiteScore: 26,
      result: "win" as const,
      timestamp: 1,
    }
    const second = {
      blackScore: 29,
      whiteScore: 35,
      result: "loss" as const,
      timestamp: 2,
    }

    recordReversiMatch(first)
    recordReversiMatch(second)

    expect(window.localStorage.getItem(REVERSI_MATCH_HISTORY_KEY)).toContain(
      '"blackScore":38',
    )
    expect(loadReversiMatches()).toEqual([first, second])
  })

  it("ignores malformed stored history", () => {
    window.localStorage.setItem(
      REVERSI_MATCH_HISTORY_KEY,
      JSON.stringify([{ result: "win" }]),
    )

    expect(loadReversiMatches()).toEqual([])
  })
})
