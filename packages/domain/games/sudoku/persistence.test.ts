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

  it("returns null when the stored difficulty exceeds the requested ceiling", () => {
    const state = buildValidState()
    const stored = JSON.parse(JSON.stringify(state))
    stored.difficulty = "hard"
    stored.puzzle.difficulty = "hard"

    expect(parseStoredSudokuGame(stored, "easy", "daily")).toBeNull()
  })

  it("accepts a stored difficulty below the requested ceiling (a fallback puzzle labeled with its actual rating)", () => {
    const state = buildValidState() // built with difficulty "easy"
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "hard", "daily")

    expect(parsed?.difficulty).toBe("easy")
    expect(parsed?.puzzle.difficulty).toBe("easy")
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

    // Pass the original `now` explicitly so the (intentional) startedAt
    // reset for a still-playing round doesn't shift the value being compared.
    const parsed = parseStoredSudokuGame(stored, "easy", "daily", 1000)

    expect(parsed).toEqual(state)
  })

  it("round-trips a valid random game state", () => {
    const puzzle = buildPuzzle(SOLUTION, [10, 11])
    const state = createSudokuGame(puzzle, "random", { now: 2000 })
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "easy", "random", 2000)

    expect(parsed).toEqual(state)
  })
})

describe("parseStoredSudokuGame — timer hydration", () => {
  it("resets startedAt to `now` for a playing round instead of continuing from a stale wall-clock timestamp", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const state = createSudokuGame(puzzle, "daily", { now: 1_000 })
    const stored = JSON.parse(JSON.stringify(state))

    // Simulate reopening the app 6 hours later.
    const sixHoursLater = 1_000 + 6 * 60 * 60 * 1000
    const parsed = parseStoredSudokuGame(stored, "easy", "daily", sixHoursLater)

    expect(parsed?.startedAt).toBe(sixHoursLater)
    // elapsedMs is the already-elapsed base carried over as-is — it must
    // never be inflated by the away-time between sessions.
    expect(parsed?.elapsedMs).toBe(state.elapsedMs)
  })

  it("carries over an accumulated elapsedMs base across a hydrate instead of losing in-session progress", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const state = { ...createSudokuGame(puzzle, "daily", { now: 1_000 }), elapsedMs: 45_000 }
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "easy", "daily", 999_999)

    expect(parsed?.elapsedMs).toBe(45_000)
    expect(parsed?.startedAt).toBe(999_999)
  })

  it("leaves startedAt untouched for a won round (timer is frozen, not ticking)", () => {
    const puzzle = buildPuzzle(SOLUTION, [40])
    let state = createSudokuGame(puzzle, "daily", { now: 1_000 })
    state = selectSudokuCell(state, 40)
    state = placeSudokuDigit(state, puzzle.solution[40] as never)
    expect(state.status).toBe("won")
    const stored = JSON.parse(JSON.stringify(state))

    const parsed = parseStoredSudokuGame(stored, "easy", "daily", 999_999_999)

    expect(parsed?.startedAt).toBe(state.startedAt)
  })
})
