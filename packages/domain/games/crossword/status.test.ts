import { describe, expect, it } from "vitest"

import {
  isCrosswordComplete,
  isCrosswordSolved,
  resolveCrosswordStatus,
} from "./status"
import { getCellKey } from "./types"
import type { CrosswordCell, CrosswordPuzzle } from "./types"

/**
 * A tiny fixture puzzle with two crossing words and known answer letters,
 * built directly so the status logic is tested independently of grid
 * generation's RNG. Layout (# = block, letters from CAT across + CAT down):
 *
 *   # C #
 *   C A T
 *   # T #
 */
function buildTestPuzzle(): CrosswordPuzzle {
  const block = (row: number, col: number): CrosswordCell => ({
    type: "block",
    row,
    col,
  })
  const letter = (row: number, col: number, answerLetter: string): CrosswordCell => ({
    type: "letter",
    row,
    col,
    answerLetter,
  })

  const grid: CrosswordCell[][] = [
    [block(0, 0), letter(0, 1, "C"), block(0, 2)],
    [letter(1, 0, "C"), letter(1, 1, "A"), letter(1, 2, "T")],
    [block(2, 0), letter(2, 1, "T"), block(2, 2)],
  ]

  return { id: "crossword-test", grid, across: [], down: [] }
}

/** Build an inputs map that perfectly solves the puzzle. */
function solvedInputs(puzzle: CrosswordPuzzle) {
  const inputs: Record<string, string> = {}
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (cell.type === "letter" && cell.answerLetter) {
        inputs[getCellKey(cell.row, cell.col)] = cell.answerLetter
      }
    }
  }
  return inputs
}

describe("isCrosswordComplete", () => {
  it("is false on an empty grid", () => {
    const puzzle = buildTestPuzzle()
    expect(isCrosswordComplete(puzzle, {})).toBe(false)
  })

  it("is true once every letter cell has any input", () => {
    const puzzle = buildTestPuzzle()
    const inputs = solvedInputs(puzzle)
    expect(isCrosswordComplete(puzzle, inputs)).toBe(true)
  })
})

describe("isCrosswordSolved", () => {
  it("is false when inputs are wrong", () => {
    const puzzle = buildTestPuzzle()
    const inputs = solvedInputs(puzzle)
    // Corrupt one cell.
    inputs[Object.keys(inputs)[0]] = "X"
    expect(isCrosswordSolved(puzzle, inputs)).toBe(false)
  })

  it("is true when every input matches the answer", () => {
    const puzzle = buildTestPuzzle()
    expect(isCrosswordSolved(puzzle, solvedInputs(puzzle))).toBe(true)
  })
})

describe("resolveCrosswordStatus", () => {
  it("transitions playing -> won when solved", () => {
    const puzzle = buildTestPuzzle()
    expect(resolveCrosswordStatus(puzzle, solvedInputs(puzzle), "playing")).toBe(
      "won",
    )
  })

  it("stays playing while incomplete", () => {
    const puzzle = buildTestPuzzle()
    expect(resolveCrosswordStatus(puzzle, {}, "playing")).toBe("playing")
  })

  it("never overrides an abandoned round", () => {
    const puzzle = buildTestPuzzle()
    expect(
      resolveCrosswordStatus(puzzle, solvedInputs(puzzle), "abandoned"),
    ).toBe("abandoned")
  })
})
