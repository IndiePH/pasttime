import { describe, expect, it } from "vitest"

import { fillGrid } from "./generate"
import { placeSudokuDigit, createSudokuGame, selectSudokuCell, toggleSudokuCandidate } from "./game"
import { getSudokuStorageKey, parseStoredSudokuGame } from "./persistence"
import { createSudokuRng } from "./rng"
import type { SudokuGameState, SudokuGrid, SudokuPuzzle } from "./types"

function buildPuzzle(solution: SudokuGrid, emptyIndexes: number[]): SudokuPuzzle {
  const givens = solution.slice()
  for (const i of emptyIndexes) givens[i] = 0
  return {
    givens,
    solution,
    difficulty: "easy",
    seed: 1,
    ratingTechnique: "naked-single",
  }
}

const SOLUTION = fillGrid(createSudokuRng(1))

function buildValidState(): SudokuGameState {
  const puzzle = buildPuzzle(SOLUTION, [0, 1, 2, 3])
  let state = createSudokuGame(puzzle, "daily", { now: 1000 })
  state = selectSudokuCell(state, 0)
  state = placeSudokuDigit(state, puzzle.solution[0] as never)
  state = selectSudokuCell(state, 1)
  state = toggleSudokuCandidate(state, 5 as never)
  return state
}

describe("getSudokuStorageKey", () => {
  it("builds the daily key from difficulty and the daily seed", () => {
    const key = getSudokuStorageKey("medium", "daily", new Date("2026-06-11T12:00:00Z"))

    expect(key).toBe("sudoku:daily:medium:20260611")
  })

  it("builds the random key from difficulty only, ignoring the date", () => {
    const key = getSudokuStorageKey("hard", "random", new Date("2026-06-11T12:00:00Z"))

    expect(key).toBe("sudoku:random:hard")
  })

  it("uses the current date by default", () => {
    const key = getSudokuStorageKey("easy", "daily")

    expect(key).toMatch(/^sudoku:daily:easy:\d{8}$/)
  })
})

describe("parseStoredSudokuGame", () => {
  it("returns null for null/undefined/non-object values", () => {
    expect(parseStoredSudokuGame(null, "easy", "daily")).toBeNull()
    expect(parseStoredSudokuGame(undefined, "easy", "daily")).toBeNull()
    expect(parseStoredSudokuGame("garbage", "easy", "daily")).toBeNull()
    expect(parseStoredSudokuGame(42, "easy", "daily")).toBeNull()
  })

  it("returns null when mode does not match", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))

    expect(parseStoredSudokuGame(stored, "easy", "random")).toBeNull()
  })

  it("returns null when difficulty does not match", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))

    expect(parseStoredSudokuGame(stored, "hard", "daily")).toBeNull()
  })

  it("returns null when status is not a valid enum value", () => {
    const state = buildValidState()
    const stored = { ...JSON.parse(JSON.stringify(state)), status: "cheating" }

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when puzzle.givens is not length 81", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.puzzle.givens = stored.puzzle.givens.slice(0, 80)

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when puzzle.solution is not length 81", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.puzzle.solution = [...stored.puzzle.solution, 5]

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when cells is not length 81", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.cells = stored.cells.slice(0, 10)

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when a cell has an out-of-range value", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.cells[0].value = 42

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when a cell's candidates contains a non-digit", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.cells[1].candidates = [0, 10]

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when required numeric fields are missing", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    delete stored.startedAt

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("returns null when the undo stack contains a malformed snapshot", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.undoStack.push([{ given: false, value: 0, candidates: [] }])

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("round-trips a valid daily game state through JSON serialization", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "easy", "daily")

    expect(parsed).toEqual(state)
  })

  it("round-trips a valid random game state", () => {
    const puzzle = buildPuzzle(SOLUTION, [10, 11])
    const state = createSudokuGame(puzzle, "random", { now: 2000 })
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "easy", "random")

    expect(parsed).toEqual(state)
  })
})
