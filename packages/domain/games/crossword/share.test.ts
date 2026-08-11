import { describe, expect, it } from "vitest"

import { buildCrosswordShareText } from "./share"
import type { CrosswordPuzzle } from "./types"

const miniPuzzle: CrosswordPuzzle = {
  id: "test",
  across: [],
  down: [],
  grid: [
    [
      { type: "block", row: 0, col: 0 },
      { type: "letter", row: 0, col: 1, answerLetter: "A" },
      { type: "letter", row: 0, col: 2, answerLetter: "B" },
    ],
    [
      { type: "letter", row: 1, col: 0, answerLetter: "C" },
      { type: "letter", row: 1, col: 1, answerLetter: "D" },
      { type: "block", row: 1, col: 2 },
    ],
  ],
}

describe("buildCrosswordShareText", () => {
  it("renders block and filled cells without letters", () => {
    const text = buildCrosswordShareText({
      puzzle: miniPuzzle,
      inputs: {
        "0,1": "X",
        "0,2": "Y",
        "1,0": "Z",
        "1,1": "W",
      },
      puzzleDate: new Date(Date.UTC(2026, 6, 20)),
    })

    expect(text).toBe(
      [
        "Pasttime Crossword",
        "Daily · 2026-07-20",
        "",
        "⬛🟩🟩",
        "🟩🟩⬛",
      ].join("\n"),
    )
    expect(text).not.toContain("A")
    expect(text).not.toContain("X")
  })
})
