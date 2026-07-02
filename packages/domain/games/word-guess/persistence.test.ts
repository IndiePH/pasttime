import { describe, expect, it } from "vitest"

import {
  getWordGuessSoloStorageKey,
  isWordGuessDailyCompleted,
} from "./persistence"
import type { WordGuessRoundState } from "./types"

const finishedDailyRound: WordGuessRoundState = {
  answer: "ABOUT",
  length: 5,
  mode: "daily",
  hardMode: false,
  maxTries: 6,
  guesses: [],
  status: "won",
}

describe("getWordGuessSoloStorageKey", () => {
  it("includes daily seed for daily mode", () => {
    const key = getWordGuessSoloStorageKey(5, "daily", new Date("2026-06-11T12:00:00Z"))

    expect(key).toBe("word-guess:solo:daily:5:20260611")
  })

  it("uses single shared slot for random mode", () => {
    const key = getWordGuessSoloStorageKey(6, "random")

    expect(key).toBe("word-guess:solo:random:session")
  })

  it("uses same slot regardless of word length for random mode", () => {
    const key5 = getWordGuessSoloStorageKey(5, "random")
    const key8 = getWordGuessSoloStorageKey(8, "random")

    expect(key5).toBe("word-guess:solo:random:session")
    expect(key8).toBe("word-guess:solo:random:session")
  })
})

describe("isWordGuessDailyCompleted", () => {
  it("returns false when no stored game exists", () => {
    expect(isWordGuessDailyCompleted(null, 5)).toBe(false)
  })

  it("returns false when daily round is still playing", () => {
    const stored = {
      round: { ...finishedDailyRound, status: "playing" as const },
      currentGuess: "",
    }

    expect(isWordGuessDailyCompleted(stored, 5)).toBe(false)
  })

  it("returns true when daily round is won for matching length", () => {
    const stored = {
      round: finishedDailyRound,
      currentGuess: "",
    }

    expect(isWordGuessDailyCompleted(stored, 5)).toBe(true)
  })

  it("returns false for a different word length", () => {
    const stored = {
      round: { ...finishedDailyRound, length: 5 as const },
      currentGuess: "",
    }

    expect(isWordGuessDailyCompleted(stored, 6)).toBe(false)
  })

  it("returns false when stored round is random mode", () => {
    const stored = {
      round: { ...finishedDailyRound, mode: "random" as const },
      currentGuess: "",
    }

    expect(isWordGuessDailyCompleted(stored, 5)).toBe(false)
  })
})
