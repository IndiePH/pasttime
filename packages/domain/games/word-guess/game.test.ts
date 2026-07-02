import { describe, expect, it } from "vitest"

import { submitWordGuessGuess } from "./game"
import type { WordGuessRoundState } from "./types"

const baseRound: WordGuessRoundState = {
  answer: "ABOUT",
  length: 5,
  mode: "random",
  hardMode: false,
  maxTries: 6,
  guesses: [],
  status: "playing",
}

describe("hard mode validation", () => {
  it("allows any valid guess when hardMode is false", () => {
    const result = submitWordGuessGuess(baseRound, "APPLE")
    expect(result.ok).toBe(true)
  })

  it("rejects guess that fails to reuse a correctly-placed letter", () => {
    const playedRound: WordGuessRoundState = {
      ...baseRound,
      hardMode: true,
      guesses: [
        {
          guess: "AWARE",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "A", state: "absent" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
      ],
    }
    // "MAGIC" is a valid dictionary word but violates position 0 (needs 'A')
    const result = submitWordGuessGuess(playedRound, "MAGIC")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("locked-letters-violation")
    }
  })

  it("allows guess that correctly reuses all locked letters in same positions", () => {
    const playedRound: WordGuessRoundState = {
      ...baseRound,
      hardMode: true,
      guesses: [
        {
          guess: "AWARE",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "A", state: "absent" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
      ],
    }
    const result = submitWordGuessGuess(playedRound, "ALBUM")
    expect(result.ok).toBe(true)
  })

  it("enforces hard mode across multiple previous guesses", () => {
    const playedRound: WordGuessRoundState = {
      ...baseRound,
      hardMode: true,
      guesses: [
        {
          guess: "AWARE",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "A", state: "absent" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
        {
          guess: "ABOUT",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "B", state: "correct" },
            { letter: "O", state: "absent" },
            { letter: "U", state: "absent" },
            { letter: "T", state: "absent" },
          ],
          isCorrect: false,
        },
      ],
    }
    // "ALPHA" is a valid word but violates position 1 (needs 'B')
    const result = submitWordGuessGuess(playedRound, "ALPHA")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("locked-letters-violation")
    }
  })

  it("allows guess when all locked letters are correctly reused across multiple guesses", () => {
    const playedRound: WordGuessRoundState = {
      ...baseRound,
      hardMode: true,
      guesses: [
        {
          guess: "AWARE",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "A", state: "absent" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
        {
          guess: "ABOUT",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "B", state: "correct" },
            { letter: "O", state: "absent" },
            { letter: "U", state: "absent" },
            { letter: "T", state: "absent" },
          ],
          isCorrect: false,
        },
      ],
    }
    const result = submitWordGuessGuess(playedRound, "ABIDE")
    expect(result.ok).toBe(true)
  })

  it("does not interfere with non-hard-mode round even when guesses exist", () => {
    const playedRound: WordGuessRoundState = {
      ...baseRound,
      hardMode: false,
      guesses: [
        {
          guess: "AWARE",
          letters: [
            { letter: "A", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "A", state: "absent" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "present" },
          ],
          isCorrect: false,
        },
      ],
    }
    const result = submitWordGuessGuess(playedRound, "ZZZZZ")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe("invalid-word")
    }
  })
})

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
