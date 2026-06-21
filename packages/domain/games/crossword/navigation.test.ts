import { describe, expect, it } from "vitest"

import type { CrosswordCell, CrosswordClue, CrosswordPuzzle } from "./types"
import {
  cellIndexInClue,
  findClueAtCell,
  getClueCells,
  nextCellInWord,
  nextClueInDirection,
  previousCellInWord,
  previousClueInDirection,
  resolveDirection,
} from "./navigation"
import type { CrosswordDirection } from "./navigation"

/**
 * Hand-built fixture puzzle for navigation tests. Only `across` / `down`
 * matter to the navigation surface (the grid array is filled in minimally
 * so the CrosswordPuzzle shape is satisfied). Layout conceptually:
 *
 *   r0:  C  A  T  .  .
 *   r1:  A  B  S  .  .
 *   r2:  D  O  G  S  .
 *   r3:  .  .  .  .  .
 *   r4:  .  .  A  T  .
 *
 * Across: 1=CAT (len 3 @ 0,0), 4=DOGS (len 4 @ 2,0), 7=AT (len 2 @ 4,2)
 * Down:   1=CAD (len 3 @ 0,0), 2=AB (len 2 @ 0,1), 3=TS (len 2 @ 0,2)
 *
 * Cell classification used by the resolveDirection matrix:
 *   (0,0) both | (0,1) both | (0,2) both
 *   (1,0) only-down | (1,1) only-down | (1,2) only-down
 *   (2,0) both (D1 ends here) | (2,1) only-across | (2,2) only-across | (2,3) only-across
 *   (4,2) only-across | (4,3) only-across
 *   (3,3) neither (no clue covers it)
 */
function buildTestPuzzle(): CrosswordPuzzle {
  const block = (row: number, col: number): CrosswordCell => ({
    type: "block",
    row,
    col,
  })
  const letter = (row: number, col: number, ch: string): CrosswordCell => ({
    type: "letter",
    row,
    col,
    answerLetter: ch,
  })

  // Minimal 5x5 grid; navigation logic never reads grid contents, only across/down.
  const grid: CrosswordCell[][] = [
    [letter(0, 0, "C"), letter(0, 1, "A"), letter(0, 2, "T"), block(0, 3), block(0, 4)],
    [letter(1, 0, "A"), letter(1, 1, "B"), letter(1, 2, "S"), block(1, 3), block(1, 4)],
    [letter(2, 0, "D"), letter(2, 1, "O"), letter(2, 2, "G"), letter(2, 3, "S"), block(2, 4)],
    [block(3, 0), block(3, 1), block(3, 2), block(3, 3), block(3, 4)],
    [block(4, 0), block(4, 1), letter(4, 2, "A"), letter(4, 3, "T"), block(4, 4)],
  ]

  const across: CrosswordClue[] = [
    { id: "a1", number: 1, direction: "across", text: "Feline", answer: "CAT", row: 0, col: 0 },
    { id: "a4", number: 4, direction: "across", text: "Pets, plural", answer: "DOGS", row: 2, col: 0 },
    { id: "a7", number: 7, direction: "across", text: "Ticklish", answer: "AT", row: 4, col: 2 },
  ]
  const down: CrosswordClue[] = [
    { id: "d1", number: 1, direction: "down", text: "Bad driver", answer: "CAD", row: 0, col: 0 },
    { id: "d2", number: 2, direction: "down", text: "Blood letters", answer: "AB", row: 0, col: 1 },
    { id: "d3", number: 3, direction: "down", text: "Stamps", answer: "TS", row: 0, col: 2 },
  ]

  return { id: "nav-test", grid, across, down }
}

describe("getClueCells", () => {
  it("walks an across clue left-to-right (length = answer.length)", () => {
    const puzzle = buildTestPuzzle()
    const cat = puzzle.across[0]
    expect(getClueCells(cat)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ])
    expect(getClueCells(cat)).toHaveLength(cat.answer.length)
  })

  it("walks a down clue top-to-bottom (length = answer.length)", () => {
    const puzzle = buildTestPuzzle()
    const cad = puzzle.down[0]
    expect(getClueCells(cad)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ])
    expect(getClueCells(cad)).toHaveLength(cad.answer.length)
  })

  it("returns exactly answer.length cells for a longer across word", () => {
    const puzzle = buildTestPuzzle()
    const dogs = puzzle.across[1]
    expect(getClueCells(dogs)).toEqual([
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
      { row: 2, col: 3 },
    ])
  })

  it("does not depend on grid contents — works on a clue with empty arrays", () => {
    const puzzle = buildTestPuzzle()
    const at = puzzle.across[2]
    expect(getClueCells(at)).toEqual([
      { row: 4, col: 2 },
      { row: 4, col: 3 },
    ])
  })
})

describe("findClueAtCell", () => {
  it("finds the across clue at the start cell", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 0, col: 0 }, "across")?.id).toBe("a1")
  })

  it("finds the across clue at a middle cell", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 0, col: 1 }, "across")?.id).toBe("a1")
  })

  it("finds the across clue at the end cell", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 2, col: 3 }, "across")?.id).toBe("a4")
  })

  it("returns null for an across search on a cell on a different row", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 1, col: 1 }, "across")).toBeNull()
  })

  it("returns null when the cell is beyond the across word span", () => {
    const puzzle = buildTestPuzzle()
    // a1 covers cols 0-2; col 3 on row 0 is a block, no across clue.
    expect(findClueAtCell(puzzle, { row: 0, col: 3 }, "across")).toBeNull()
  })

  it("finds the down clue at a middle cell", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 1, col: 0 }, "down")?.id).toBe("d1")
  })

  it("returns null for a down search on a cell on a different col", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 1, col: 2 }, "down")?.id).not.toBe("d1")
  })

  it("returns null when the cell is beyond the down word span", () => {
    const puzzle = buildTestPuzzle()
    // d1 covers rows 0-2; row 3 col 0 is a block.
    expect(findClueAtCell(puzzle, { row: 3, col: 0 }, "down")).toBeNull()
  })

  it("returns null for a cell that has no clue in either direction", () => {
    const puzzle = buildTestPuzzle()
    expect(findClueAtCell(puzzle, { row: 3, col: 3 }, "across")).toBeNull()
    expect(findClueAtCell(puzzle, { row: 3, col: 3 }, "down")).toBeNull()
  })
})

describe("resolveDirection", () => {
  // 4-case matrix: both | only-across | only-down | neither × preferred across|down.
  type Case = {
    name: string
    cell: { row: number; col: number }
    preferred: CrosswordDirection
    expected: CrosswordDirection
  }
  const bothCell = { row: 0, col: 0 } // A1 + D1
  const onlyAcrossCell = { row: 2, col: 1 } // A4 only
  const onlyDownCell = { row: 1, col: 1 } // D2 only
  const neitherCell = { row: 3, col: 3 } // neither

  const cases: Case[] = [
    // (a) cell in both across + down → returns preferred
    { name: "both / preferred across → across", cell: bothCell, preferred: "across", expected: "across" },
    { name: "both / preferred down → down", cell: bothCell, preferred: "down", expected: "down" },
    // (b) cell only-across → returns across regardless of preferred
    { name: "only-across / preferred across → across", cell: onlyAcrossCell, preferred: "across", expected: "across" },
    { name: "only-across / preferred down → across", cell: onlyAcrossCell, preferred: "down", expected: "across" },
    // (c) cell only-down → returns down
    { name: "only-down / preferred across → down", cell: onlyDownCell, preferred: "across", expected: "down" },
    { name: "only-down / preferred down → down", cell: onlyDownCell, preferred: "down", expected: "down" },
    // (d) cell in neither → returns preferred unchanged
    { name: "neither / preferred across → across", cell: neitherCell, preferred: "across", expected: "across" },
    { name: "neither / preferred down → down", cell: neitherCell, preferred: "down", expected: "down" },
  ]

  it.each(cases)("$name", ({ cell, preferred, expected }) => {
    const puzzle = buildTestPuzzle()
    expect(resolveDirection(puzzle, cell, preferred)).toBe(expected)
  })

  it("NEVER returns a direction with no word when ANY word exists at the cell", () => {
    const puzzle = buildTestPuzzle()
    // onlyAcrossCell has only an across word — regardless of preferred, result must be across.
    const result1 = resolveDirection(puzzle, { row: 2, col: 1 }, "down")
    expect(result1).toBe("across")
    const clue = findClueAtCell(puzzle, { row: 2, col: 1 }, result1)
    expect(clue).not.toBeNull()
  })
})

describe("cellIndexInClue", () => {
  it("returns 0 at the clue's start cell (across)", () => {
    const puzzle = buildTestPuzzle()
    expect(cellIndexInClue(puzzle.across[1], { row: 2, col: 0 })).toBe(0)
  })

  it("returns len-1 at the clue's end cell (across)", () => {
    const puzzle = buildTestPuzzle()
    expect(cellIndexInClue(puzzle.across[1], { row: 2, col: 3 })).toBe(
      puzzle.across[1].answer.length - 1,
    )
  })

  it("returns the correct offset for a middle cell (down)", () => {
    const puzzle = buildTestPuzzle()
    expect(cellIndexInClue(puzzle.down[0], { row: 1, col: 0 })).toBe(1)
  })

  it("returns -1 for a cell not part of the clue", () => {
    const puzzle = buildTestPuzzle()
    expect(cellIndexInClue(puzzle.across[0], { row: 5, col: 5 })).toBe(-1)
    expect(cellIndexInClue(puzzle.down[0], { row: 0, col: 1 })).toBe(-1)
  })
})

describe("nextCellInWord", () => {
  it("returns the next cell from the middle of a word", () => {
    const puzzle = buildTestPuzzle()
    expect(nextCellInWord(puzzle.across[1], { row: 2, col: 1 })).toEqual({
      row: 2,
      col: 2,
    })
  })

  it("returns the second cell from the first cell", () => {
    const puzzle = buildTestPuzzle()
    expect(nextCellInWord(puzzle.across[0], { row: 0, col: 0 })).toEqual({
      row: 0,
      col: 1,
    })
  })

  it("returns null at the last cell (D-06 stop-at-end)", () => {
    const puzzle = buildTestPuzzle()
    expect(nextCellInWord(puzzle.across[1], { row: 2, col: 3 })).toBeNull()
    expect(nextCellInWord(puzzle.down[0], { row: 2, col: 0 })).toBeNull()
  })
})

describe("previousCellInWord", () => {
  it("returns the previous cell from the middle of a word", () => {
    const puzzle = buildTestPuzzle()
    expect(previousCellInWord(puzzle.across[1], { row: 2, col: 2 })).toEqual({
      row: 2,
      col: 1,
    })
  })

  it("returns the penultimate cell from the last cell", () => {
    const puzzle = buildTestPuzzle()
    expect(previousCellInWord(puzzle.across[1], { row: 2, col: 3 })).toEqual({
      row: 2,
      col: 2,
    })
  })

  it("returns null at the first cell (D-12 boundary)", () => {
    const puzzle = buildTestPuzzle()
    expect(previousCellInWord(puzzle.across[0], { row: 0, col: 0 })).toBeNull()
    expect(previousCellInWord(puzzle.down[0], { row: 0, col: 0 })).toBeNull()
  })
})

describe("nextClueInDirection", () => {
  it("returns the next clue from the middle of the list", () => {
    const puzzle = buildTestPuzzle()
    expect(
      nextClueInDirection(puzzle, "across", 1).number,
    ).toBe(4)
  })

  it("wraps from the last clue to the first", () => {
    const puzzle = buildTestPuzzle()
    expect(nextClueInDirection(puzzle, "across", 7).number).toBe(1)
    expect(nextClueInDirection(puzzle, "down", 3).number).toBe(1)
  })

  it("returns the first clue when currentNumber is undefined", () => {
    const puzzle = buildTestPuzzle()
    expect(nextClueInDirection(puzzle, "across", undefined).number).toBe(1)
    expect(nextClueInDirection(puzzle, "down", undefined).number).toBe(1)
  })
})

describe("previousClueInDirection", () => {
  it("returns the previous clue from the middle of the list", () => {
    const puzzle = buildTestPuzzle()
    expect(
      previousClueInDirection(puzzle, "across", 4).number,
    ).toBe(1)
  })

  it("wraps from the first clue to the last", () => {
    const puzzle = buildTestPuzzle()
    expect(previousClueInDirection(puzzle, "across", 1).number).toBe(7)
    expect(previousClueInDirection(puzzle, "down", 1).number).toBe(3)
  })

  it("returns the last clue when currentNumber is undefined", () => {
    const puzzle = buildTestPuzzle()
    expect(previousClueInDirection(puzzle, "across", undefined).number).toBe(7)
    expect(previousClueInDirection(puzzle, "down", undefined).number).toBe(3)
  })
})
