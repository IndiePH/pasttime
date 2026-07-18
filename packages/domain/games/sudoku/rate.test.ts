import { describe, expect, it } from "vitest"
import { rateSudoku } from "./rate"
import {
  EASY_SINGLES_ONLY_GIVENS,
  EMPTY_GIVENS,
  HARD_NAKED_TRIPLE_GIVENS,
  INVALID_DUPLICATE_GIVENS,
  MEDIUM_NAKED_PAIR_GIVENS,
  UNRATED_NEEDS_BACKTRACKING_GIVENS,
} from "./fixtures"

describe("rateSudoku", () => {
  it("rates a singles-only puzzle as easy", () => {
    const result = rateSudoku(EASY_SINGLES_ONLY_GIVENS)
    expect(result.solvable).toBe(true)
    expect(result.difficulty).toBe("easy")
    expect(["naked-single", "hidden-single"]).toContain(result.hardest)
  })

  it("rates a puzzle needing a naked pair as medium", () => {
    const result = rateSudoku(MEDIUM_NAKED_PAIR_GIVENS)
    expect(result.solvable).toBe(true)
    expect(result.difficulty).toBe("medium")
    expect(result.hardest).toBe("naked-pair")
  })

  it("rates a puzzle needing a naked triple as hard", () => {
    const result = rateSudoku(HARD_NAKED_TRIPLE_GIVENS)
    expect(result.solvable).toBe(true)
    expect(result.difficulty).toBe("hard")
    expect(result.hardest).toBe("naked-triple")
  })

  it("marks an empty grid as unsolvable / unrated", () => {
    const result = rateSudoku(EMPTY_GIVENS)
    expect(result.solvable).toBe(false)
    expect(result.difficulty).toBe("unrated")
    expect(result.hardest).toBe(null)
  })

  it("marks a grid with duplicate givens as unsolvable / unrated", () => {
    const result = rateSudoku(INVALID_DUPLICATE_GIVENS)
    expect(result.solvable).toBe(false)
    expect(result.difficulty).toBe("unrated")
    expect(result.hardest).toBe(null)
  })

  it("marks a puzzle needing backtracking as unsolvable / unrated", () => {
    const result = rateSudoku(UNRATED_NEEDS_BACKTRACKING_GIVENS)
    expect(result.solvable).toBe(false)
    expect(result.difficulty).toBe("unrated")
  })

  it("never rates above hard (no technique beyond triples)", () => {
    for (const grid of [
      EASY_SINGLES_ONLY_GIVENS,
      MEDIUM_NAKED_PAIR_GIVENS,
      HARD_NAKED_TRIPLE_GIVENS,
    ]) {
      const result = rateSudoku(grid)
      expect(["easy", "medium", "hard"]).toContain(result.difficulty)
    }
  })
})
