import { describe, expect, it } from "vitest"

import { evaluateWordGuessGuess } from "./evaluate-guess"

describe("evaluateWordGuessGuess", () => {
  it("marks exact matches as correct", () => {
    const evaluation = evaluateWordGuessGuess("CRANE", "CRANE")

    expect(evaluation.isCorrect).toBe(true)
    expect(evaluation.letters.map((item) => item.state)).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ])
  })

  it("handles duplicate letters with remaining-count logic", () => {
    const evaluation = evaluateWordGuessGuess("LEVEL", "HELLO")

    expect(evaluation.letters.map((item) => item.state)).toEqual([
      "absent",
      "correct",
      "present",
      "present",
      "absent",
    ])
  })
})
