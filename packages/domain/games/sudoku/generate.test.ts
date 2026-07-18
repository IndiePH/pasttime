import { describe, expect, it } from "vitest"
import {
  carve,
  countSolutions,
  createGameCellsFromPuzzle,
  fillGrid,
  generateSudoku,
  SUDOKU_GENERATE_MAX_ATTEMPTS,
} from "./generate"
import { createSudokuRng } from "./rng"
import { rateSudoku } from "./rate"
import type { SudokuDifficulty } from "./settings"

const GENERATE_TEST_TIMEOUT = 20_000

function isCompleteSolution(grid: number[]): boolean {
  return grid.length === 81 && grid.every((d) => d >= 1 && d <= 9)
}

describe("fillGrid", () => {
  it("produces a complete, valid, deterministic solution", () => {
    const a = fillGrid(createSudokuRng(1))
    const b = fillGrid(createSudokuRng(1))
    expect(a).toEqual(b)
    expect(isCompleteSolution(a)).toBe(true)
    expect(rateSudoku(a).solvable).toBe(true)
  })

  it("produces different solutions for different seeds", () => {
    const a = fillGrid(createSudokuRng(1))
    const b = fillGrid(createSudokuRng(2))
    expect(a).not.toEqual(b)
  })
})

describe("countSolutions", () => {
  it("counts exactly one solution for a complete grid", () => {
    const solution = fillGrid(createSudokuRng(5))
    expect(countSolutions(solution, 2)).toBe(1)
  })

  it("counts zero solutions for a contradictory grid", () => {
    // Row 0 fills digits 1–8 (index 8 empty, needs 9 by row elimination),
    // but column 8 already places a 9 elsewhere, and the same 9 also
    // appears in index 8's box — leaving zero legal candidates for it.
    const broken = new Array(81).fill(0)
    broken[0] = 1
    broken[1] = 2
    broken[2] = 3
    broken[3] = 4
    broken[4] = 5
    broken[5] = 6
    broken[6] = 7
    broken[7] = 8
    broken[17] = 9 // row 1, col 8
    expect(countSolutions(broken, 2)).toBe(0)
  })

  it("aborts at the given limit for an empty grid (many solutions)", () => {
    expect(countSolutions(new Array(81).fill(0), 2)).toBe(2)
  })
})

describe("carve", () => {
  it("never returns a rating above the target difficulty ceiling", () => {
    const solution = fillGrid(createSudokuRng(9))
    for (const difficulty of ["easy", "medium", "hard"] as SudokuDifficulty[]) {
      const { givens, rating } = carve(solution, createSudokuRng(9), difficulty)
      expect(countSolutions(givens, 2)).toBe(1)
      if (rating.difficulty !== "unrated") {
        const rank = { easy: 0, medium: 1, hard: 2 }[rating.difficulty]
        const ceiling = { easy: 0, medium: 1, hard: 2 }[difficulty]
        expect(rank).toBeLessThanOrEqual(ceiling)
      }
    }
  })
})

describe("generateSudoku", () => {
  it("is deterministic for the same seed and difficulty", () => {
    const a = generateSudoku({ difficulty: "easy", seed: 20260718 })
    const b = generateSudoku({ difficulty: "easy", seed: 20260718 })
    expect(a.givens).toEqual(b.givens)
    expect(a.solution).toEqual(b.solution)
  })

  it("returns a unique-solution puzzle within the difficulty ceiling", () => {
    const puzzle = generateSudoku({ difficulty: "easy", seed: 42 })
    const rating = rateSudoku(puzzle.givens)
    expect(rating.solvable).toBe(true)
    expect(rating.difficulty).toBe("easy")
    expect(puzzle.solution.every((d) => d >= 1 && d <= 9)).toBe(true)
    expect(countSolutions(puzzle.givens, 2)).toBe(1)
  })

  it("never rates easy above singles", () => {
    for (const seed of [1, 2, 3, 7, 11]) {
      const puzzle = generateSudoku({ difficulty: "easy", seed })
      expect(rateSudoku(puzzle.givens).difficulty).toBe("easy")
    }
  })

  it("produces a solvable puzzle whose givens match the solution", () => {
    const puzzle = generateSudoku({ difficulty: "medium", seed: 123 })
    for (let i = 0; i < 81; i++) {
      if (puzzle.givens[i] !== 0) {
        expect(puzzle.givens[i]).toBe(puzzle.solution[i])
      }
    }
  })

  it(
    "generates a medium puzzle at or below the medium ceiling",
    () => {
      const puzzle = generateSudoku({ difficulty: "medium", seed: 555 })
      const rating = rateSudoku(puzzle.givens)
      expect(rating.solvable).toBe(true)
      expect(["easy", "medium"]).toContain(rating.difficulty)
      expect(countSolutions(puzzle.givens, 2)).toBe(1)
    },
    GENERATE_TEST_TIMEOUT,
  )

  it(
    "generates a hard puzzle at or below the hard ceiling",
    () => {
      const puzzle = generateSudoku({ difficulty: "hard", seed: 777 })
      const rating = rateSudoku(puzzle.givens)
      expect(rating.solvable).toBe(true)
      expect(["easy", "medium", "hard"]).toContain(rating.difficulty)
      expect(countSolutions(puzzle.givens, 2)).toBe(1)
    },
    GENERATE_TEST_TIMEOUT,
  )

  it("respects a custom maxAttempts option without throwing", () => {
    const puzzle = generateSudoku({ difficulty: "easy", seed: 99, maxAttempts: 3 })
    expect(countSolutions(puzzle.givens, 2)).toBe(1)
  })

  it("exposes the documented max-attempts constant", () => {
    expect(SUDOKU_GENERATE_MAX_ATTEMPTS).toBe(50)
  })
})

describe("createGameCellsFromPuzzle", () => {
  it("marks non-zero givens as given cells and zeros as empty", () => {
    const puzzle = generateSudoku({ difficulty: "easy", seed: 8 })
    const cells = createGameCellsFromPuzzle(puzzle)
    expect(cells).toHaveLength(81)
    for (let i = 0; i < 81; i++) {
      const given = puzzle.givens[i] !== 0
      expect(cells[i].given).toBe(given)
      expect(cells[i].value).toBe(puzzle.givens[i])
      expect(cells[i].candidates).toEqual([])
    }
  })
})
