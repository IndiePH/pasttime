import { describe, expect, it } from "vitest"

import { buildSudokuShareText } from "./share"

describe("buildSudokuShareText", () => {
  it("includes difficulty and the formatted time", () => {
    const text = buildSudokuShareText({
      difficultyLabel: "Medium",
      elapsedLabel: "12:07",
      puzzleDate: new Date("2026-11-04T18:00:00Z"),
      shareUrl: "https://pasttime.xyz/games/sudoku",
    })

    expect(text).toContain("Pasttime Sudoku\nDaily · 2026-11-04")
    expect(text).toContain("Medium")
    expect(text).toContain("12:07")
    expect(text.endsWith("https://pasttime.xyz/games/sudoku")).toBe(true)
  })

  it("does not include a digit grid", () => {
    const text = buildSudokuShareText({
      difficultyLabel: "Hard",
      elapsedLabel: "1:05:09",
      puzzleDate: new Date("2026-11-04T00:30:00Z"),
    })

    expect(text).not.toMatch(/\b[1-9](?:\s+[1-9]){8}\b/)
    expect(text).not.toContain("123456789")
    expect(text.split("\n").every((line) => !/^[0-9]{9}$/.test(line))).toBe(true)
  })
})
