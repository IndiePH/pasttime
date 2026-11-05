import { describe, expect, it } from "vitest"

import { createTypingState, submitTypingCharacter } from "./input"
import { computeTypingMetrics } from "./metrics"

describe("computeTypingMetrics", () => {
  it("computes accuracy and WPM from processed characters", () => {
    let state = createTypingState("abcd")
    state = submitTypingCharacter(state, "a")
    state = submitTypingCharacter(state, "x")
    state = submitTypingCharacter(state, "c")
    state = submitTypingCharacter(state, "d")

    expect(computeTypingMetrics(state, 60_000)).toEqual({
      correctChars: 3,
      errorChars: 1,
      processedChars: 4,
      accuracy: 0.75,
      wpm: 0.8,
    })
  })

  it("returns zero metrics before typing or when elapsed time is zero", () => {
    expect(computeTypingMetrics(createTypingState("abc"), 0)).toEqual({
      correctChars: 0,
      errorChars: 0,
      processedChars: 0,
      accuracy: 0,
      wpm: 0,
    })
  })
})
