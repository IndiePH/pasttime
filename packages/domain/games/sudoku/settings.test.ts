import { describe, expect, it } from "vitest"
import {
  parseSudokuDifficulty,
  SUDOKU_DIFFICULTY_DEFAULT,
  isSudokuDifficulty,
} from "./settings"

describe("parseSudokuDifficulty", () => {
  it("accepts easy medium hard", () => {
    expect(parseSudokuDifficulty("easy")).toBe("easy")
    expect(parseSudokuDifficulty("medium")).toBe("medium")
    expect(parseSudokuDifficulty("hard")).toBe("hard")
  })
  it("falls back to default", () => {
    expect(parseSudokuDifficulty("nope")).toBe(SUDOKU_DIFFICULTY_DEFAULT)
    expect(isSudokuDifficulty("easy")).toBe(true)
    expect(isSudokuDifficulty("expert")).toBe(false)
  })
})
