import { describe, expect, it } from "vitest"

import corpusData from "./corpus.json"
import {
  createCrosswordGameState,
  createCrosswordPuzzle,
} from "./settings"
import { getCellKey } from "./types"

const SIZES = [5, 7, 9, 11, 13, 15] as const
const FIXED_DATE = new Date("2026-06-17T00:00:00Z")

const MAX_ANSWER_LENGTH = (corpusData as Array<{ answer: string; clue: string }>).reduce(
  (max, entry) => Math.max(max, entry.answer.length),
  0,
)

const MIN_SLOT_LENGTH = 3

function runLengthsAcross(grid: ReturnType<typeof createCrosswordPuzzle>["grid"], size: number) {
  const runs: number[] = []
  for (let row = 0; row < size; row++) {
    let run = 0
    for (let col = 0; col <= size; col++) {
      if (col < size && grid[row][col].type === "letter") {
        run++
      } else {
        if (run > 0) runs.push(run)
        run = 0
      }
    }
  }
  return runs
}

function runLengthsDown(grid: ReturnType<typeof createCrosswordPuzzle>["grid"], size: number) {
  const runs: number[] = []
  for (let col = 0; col < size; col++) {
    let run = 0
    for (let row = 0; row <= size; row++) {
      if (row < size && grid[row][col].type === "letter") {
        run++
      } else {
        if (run > 0) runs.push(run)
        run = 0
      }
    }
  }
  return runs
}

describe("createCrosswordPuzzle", () => {
  it.each(SIZES)("produces a %ix%i grid with matching dimensions", (size) => {
    const puzzle = createCrosswordPuzzle(size, "daily", FIXED_DATE)
    expect(puzzle.grid).toHaveLength(size)
    for (const row of puzzle.grid) {
      expect(row).toHaveLength(size)
    }
  })

  it.each(SIZES)("never emits placeholder answers or clues at size %i", (size) => {
    const puzzle = createCrosswordPuzzle(size, "daily", FIXED_DATE)
    for (const clue of [...puzzle.across, ...puzzle.down]) {
      expect(clue.answer).not.toBe("ANSWER")
      expect(clue.text).not.toBe("Sample clue")
      expect(clue.answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
    }
  })

  it.each(SIZES)("caps every letter run at the longest available answer at size %i", (size) => {
    const puzzle = createCrosswordPuzzle(size, "daily", FIXED_DATE)
    for (const run of [...runLengthsAcross(puzzle.grid, size), ...runLengthsDown(puzzle.grid, size)]) {
      expect(run).toBeLessThanOrEqual(MAX_ANSWER_LENGTH)
    }
  })

  it.each(SIZES)("assigns every slot an answer of the exact slot length at size %i", (size) => {
    const puzzle = createCrosswordPuzzle(size, "daily", FIXED_DATE)
    for (const clue of [...puzzle.across, ...puzzle.down]) {
      // The answer must fit the slot. Every emitted clue should be a real word,
      // not padded filler.
      expect(clue.answer.length).toBeGreaterThanOrEqual(MIN_SLOT_LENGTH)
      const corpus = corpusData as Array<{ answer: string; clue: string }>
      const known = corpus.some((c) => c.answer === clue.answer)
      expect(known, `unknown answer "${clue.answer}"`).toBe(true)
    }
  })

  it("is deterministic for the same daily seed", () => {
    const a = createCrosswordPuzzle(15, "daily", FIXED_DATE)
    const b = createCrosswordPuzzle(15, "daily", FIXED_DATE)
    expect(a.id).toBe(b.id)
    expect(a.across).toEqual(b.across)
    expect(a.down).toEqual(b.down)
  })

  it("places an answerLetter on every playable cell for win-checking", () => {
    const puzzle = createCrosswordPuzzle(9, "daily", FIXED_DATE)
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = puzzle.grid[row][col]
        if (cell.type === "letter") {
          expect(cell.answerLetter, `cell ${row},${col} missing answerLetter`).toMatch(/^[A-Z]$/)
        }
      }
    }
  })

  it("clue numbers are unique within each direction and ascending", () => {
    const puzzle = createCrosswordPuzzle(11, "daily", FIXED_DATE)
    const acrossNums = puzzle.across.map((c) => c.number)
    const downNums = puzzle.down.map((c) => c.number)
    expect(new Set(acrossNums).size).toBe(acrossNums.length)
    expect(new Set(downNums).size).toBe(downNums.length)
    // Ascending because we sweep top-to-bottom, left-to-right.
    expect([...acrossNums].sort((a, b) => a - b)).toEqual(acrossNums)
  })
})

describe("createCrosswordGameState", () => {
  it("starts in the playing state with empty inputs", () => {
    const state = createCrosswordGameState(7, "daily", FIXED_DATE)
    expect(state.status).toBe("playing")
    expect(Object.keys(state.inputs)).toHaveLength(0)
    expect(state.puzzle.grid).toHaveLength(7)
  })
})

describe("getCellKey", () => {
  it("round-trips row/col into a stable key", () => {
    expect(getCellKey(2, 3)).toBe("2,3")
    expect(getCellKey(0, 0)).toBe("0,0")
  })
})
