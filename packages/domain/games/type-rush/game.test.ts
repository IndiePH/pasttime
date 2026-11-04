import { describe, expect, it } from "vitest"

import {
  createTypeRushRound,
  getTypeRushMetrics,
  pickTypeRushPrompt,
  submitTypeRushCharacter,
} from "./index"

describe("Type Rush game", () => {
  it("selects the same daily prompt for the same date", () => {
    const first = pickTypeRushPrompt("daily", new Date("2026-11-04T12:00:00Z"))
    const second = pickTypeRushPrompt("daily", new Date("2026-11-04T23:00:00Z"))

    expect(second).toEqual(first)
  })

  it("allows a custom prompt for focused round tests", () => {
    const round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "ab" },
      now: 1_000,
    })

    expect(round.text).toBe("ab")
    expect(round.status).toBe("playing")
    expect(round.startedAt).toBeNull()
  })

  it("starts timing on the first character and completes forgivingly", () => {
    let round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "ab" },
      now: 1_000,
    })

    round = submitTypeRushCharacter(round, "x", 2_000)
    expect(round.status).toBe("playing")
    expect(round.startedAt).toBe(2_000)

    round = submitTypeRushCharacter(round, "b", 3_500)

    expect(round.status).toBe("won")
    expect(round.startedAt).toBeNull()
    expect(round.elapsedMs).toBe(1_500)
    expect(getTypeRushMetrics(round)).toMatchObject({
      correctChars: 1,
      errorChars: 1,
      processedChars: 2,
      accuracy: 0.5,
    })
  })

  it("ignores input after the round is complete", () => {
    const round = createTypeRushRound({
      mode: "practice",
      prompt: { id: "test", text: "a" },
    })
    const completed = submitTypeRushCharacter(round, "a", 10)
    const unchanged = submitTypeRushCharacter(completed, "b", 20)

    expect(unchanged).toBe(completed)
  })
})
