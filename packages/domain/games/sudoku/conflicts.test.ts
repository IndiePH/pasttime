import { describe, expect, it } from "vitest"
import { findConflictIndexes } from "./conflicts"
import type { SudokuCell } from "./types"

function cell(value: number, given = false): SudokuCell {
  return { given, value, candidates: [] }
}

describe("findConflictIndexes", () => {
  it("flags duplicate digits in a row", () => {
    const cells = Array.from({ length: 81 }, () => cell(0))
    cells[0] = cell(5)
    cells[1] = cell(5)
    const conflicts = findConflictIndexes(cells)
    expect(conflicts.has(0)).toBe(true)
    expect(conflicts.has(1)).toBe(true)
  })
  it("ignores empties", () => {
    const cells = Array.from({ length: 81 }, () => cell(0))
    expect(findConflictIndexes(cells).size).toBe(0)
  })
})
