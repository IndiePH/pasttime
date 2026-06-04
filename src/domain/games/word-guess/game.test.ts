import { describe, expect, it } from "vitest"

import { submitWordGuessGuess } from "@/domain/games/word-guess/game"
import type { WordGuessRoundState } from "@/domain/games/word-guess/types"

const baseRound: WordGuessRoundState = {
  answer: "ABOUT",
  length: 5,
  mode: "random",
  maxTries: 6,
  guesses: [],
  status: "playing",
}

describe("submitWordGuessGuess", () => {
  it("rejects invalid-length guesses", () => {
    const result = submitWordGuessGuess(baseRound, "TREE")

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("invalid-length")
    }
  })

  it("rejects dictionary-missing guesses", () => {
    const result = submitWordGuessGuess(baseRound, "ZZZZZ")

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("invalid-word")
    }
  })

  it("wins when guess matches answer", () => {
    const result = submitWordGuessGuess(baseRound, "ABOUT")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.round.status).toBe("won")
      expect(result.round.guesses).toHaveLength(1)
    }
  })

  it("loses when max tries are consumed", () => {
    const nearlyDone: WordGuessRoundState = {
      ...baseRound,
      guesses: [
        {
          guess: "APPLE",
          letters: [
            { letter: "A", state: "absent" },
            { letter: "P", state: "absent" },
            { letter: "P", state: "absent" },
            { letter: "L", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
        {
          guess: "STONE",
          letters: [
            { letter: "S", state: "absent" },
            { letter: "T", state: "absent" },
            { letter: "O", state: "absent" },
            { letter: "N", state: "present" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
        {
          guess: "PLANT",
          letters: [
            { letter: "P", state: "absent" },
            { letter: "L", state: "absent" },
            { letter: "A", state: "correct" },
            { letter: "N", state: "present" },
            { letter: "T", state: "absent" },
          ],
          isCorrect: false,
        },
        {
          guess: "HOUSE",
          letters: [
            { letter: "H", state: "absent" },
            { letter: "O", state: "absent" },
            { letter: "U", state: "absent" },
            { letter: "S", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
        {
          guess: "MANGO",
          letters: [
            { letter: "M", state: "absent" },
            { letter: "A", state: "correct" },
            { letter: "N", state: "present" },
            { letter: "G", state: "absent" },
            { letter: "O", state: "absent" },
          ],
          isCorrect: false,
        },
      ],
    }

    const result = submitWordGuessGuess(nearlyDone, "ABIDE")

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.round.status).toBe("lost")
      expect(result.round.guesses).toHaveLength(6)
    }
  })
})
