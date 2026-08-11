import { describe, expect, it } from "vitest"

import { buildWordGuessShareText } from "./share"
import type { WordGuessGuessEvaluation } from "./types"

const sampleGuesses: WordGuessGuessEvaluation[] = [
  {
    guess: "CRANE",
    isCorrect: false,
    letters: [
      { letter: "C", state: "absent" },
      { letter: "R", state: "present" },
      { letter: "A", state: "absent" },
      { letter: "N", state: "present" },
      { letter: "E", state: "correct" },
    ],
  },
  {
    guess: "STORE",
    isCorrect: true,
    letters: [
      { letter: "S", state: "correct" },
      { letter: "T", state: "correct" },
      { letter: "O", state: "correct" },
      { letter: "R", state: "correct" },
      { letter: "E", state: "correct" },
    ],
  },
]

describe("buildWordGuessShareText", () => {
  it("formats header, score, and emoji rows", () => {
    const text = buildWordGuessShareText({
      guesses: sampleGuesses,
      maxTries: 6,
      puzzleDate: new Date(Date.UTC(2026, 6, 20)),
    })

    expect(text).toContain("Pasttime Word Guess\nDaily · 2026-07-20")
    expect(text).toContain("2/6")
    expect(text).toContain("⬜🟨⬜🟨🟩")
    expect(text).toContain("🟩🟩🟩🟩🟩")
    expect(text.startsWith(" ")).toBe(false)
    expect(text.split("\n").some((line) => line.startsWith(" "))).toBe(false)
  })

  it("does not include guess words or answer letters as text", () => {
    const text = buildWordGuessShareText({
      guesses: sampleGuesses,
      maxTries: 6,
    })

    expect(text).not.toContain("CRANE")
    expect(text).not.toContain("STORE")
  })

  it("appends share URL when provided", () => {
    const text = buildWordGuessShareText({
      guesses: sampleGuesses,
      maxTries: 6,
      shareUrl: "https://gamehub.pasttime.xyz/games/word-guess",
    })

    expect(text.endsWith("https://gamehub.pasttime.xyz/games/word-guess")).toBe(
      true,
    )
  })
})
