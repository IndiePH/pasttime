import { describe, expect, it } from "vitest"
import { legalCandidates, peerIndexes } from "./board"
import { fillGrid, generateSudoku } from "./generate"
import {
  clearSudokuCell,
  createSudokuGame,
  placeSudokuDigit,
  recomputeSudokuWin,
  selectSudokuCell,
  setSudokuAutoCandidates,
  setSudokuCandidateMode,
  toggleSudokuCandidate,
  undoSudoku,
} from "./game"
import { createSudokuRng } from "./rng"
import type { SudokuGameState, SudokuGrid, SudokuPuzzle } from "./types"

/** Builds a valid, minimal puzzle fixture: a real full solution with the
 * given indexes blanked out. Always structurally valid since it is a strict
 * subset of an actual solved grid. */
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

describe("createSudokuGame", () => {
  it("builds fresh playing state from a puzzle", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1, 2])
    const state = createSudokuGame(puzzle, "daily", { now: 1000 })

    expect(state.status).toBe("playing")
    expect(state.mode).toBe("daily")
    expect(state.difficulty).toBe(puzzle.difficulty)
    expect(state.candidateMode).toBe(false)
    expect(state.autoCandidates).toBe(false)
    expect(state.selectedIndex).toBeNull()
    expect(state.undoStack).toEqual([])
    expect(state.startedAt).toBe(1000)
    expect(state.elapsedMs).toBe(0)
    expect(state.cells).toHaveLength(81)
    expect(state.cells[0]).toEqual({ given: false, value: 0, candidates: [] })
    expect(state.cells[3]).toEqual({ given: true, value: puzzle.givens[3], candidates: [] })
  })

  it("defaults startedAt to the current clock when no now is given", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const before = Date.now()
    const state = createSudokuGame(puzzle, "random")
    expect(state.startedAt).toBeGreaterThanOrEqual(before)
  })

  it("auto-fills empty cell candidates when autoCandidates is enabled", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1, 2])
    const state = createSudokuGame(puzzle, "daily", { autoCandidates: true, now: 0 })

    expect(state.autoCandidates).toBe(true)
    for (let i = 0; i < 81; i++) {
      if (puzzle.givens[i] !== 0) {
        expect(state.cells[i].candidates).toEqual([])
      } else {
        expect(state.cells[i].candidates).toEqual(legalCandidates(state.cells, i))
      }
    }
  })
})

describe("selectSudokuCell", () => {
  it("sets the selected index", () => {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [0]), "daily", { now: 0 })
    const next = selectSudokuCell(state, 0)
    expect(next.selectedIndex).toBe(0)
  })

  it("ignores out-of-range indexes", () => {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [0]), "daily", { now: 0 })
    expect(selectSudokuCell(state, -1)).toBe(state)
    expect(selectSudokuCell(state, 81)).toBe(state)
  })
})

describe("setSudokuCandidateMode", () => {
  it("toggles candidate entry mode", () => {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [0]), "daily", { now: 0 })
    const on = setSudokuCandidateMode(state, true)
    expect(on.candidateMode).toBe(true)
    const off = setSudokuCandidateMode(on, false)
    expect(off.candidateMode).toBe(false)
  })
})

describe("placeSudokuDigit", () => {
  function playingStateAt(index: number, options?: { autoCandidates?: boolean }): SudokuGameState {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [index]), "daily", {
      now: 0,
      autoCandidates: options?.autoCandidates,
    })
    return selectSudokuCell(state, index)
  }

  it("sets the value and clears candidates on the selected empty cell", () => {
    const index = 5
    const state = playingStateAt(index)
    const digit = SOLUTION[index]
    const next = placeSudokuDigit(state, digit as never)

    expect(next.cells[index].value).toBe(digit)
    expect(next.cells[index].candidates).toEqual([])
    expect(next.cells[index].given).toBe(false)
  })

  it("pushes a full cells snapshot onto the undo stack before mutating", () => {
    const index = 7
    const state = playingStateAt(index)
    const before = state.cells
    const next = placeSudokuDigit(state, SOLUTION[index] as never)

    expect(next.undoStack).toHaveLength(1)
    expect(next.undoStack[0]).toEqual(before)
    expect(next.undoStack[0]).not.toBe(before) // snapshot must be a deep copy
  })

  it("ignores placement on given cells", () => {
    const puzzle = buildPuzzle(SOLUTION, [10])
    const givenIndex = 0
    const state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), givenIndex)
    expect(state.cells[givenIndex].given).toBe(true)

    const next = placeSudokuDigit(state, 9)
    expect(next).toBe(state)
  })

  it("ignores placement when no cell is selected", () => {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [0]), "daily", { now: 0 })
    expect(state.selectedIndex).toBeNull()
    const next = placeSudokuDigit(state, 5)
    expect(next).toBe(state)
  })

  it("ignores placement when the round is not playing", () => {
    const state = { ...playingStateAt(0), status: "abandoned" as const }
    const next = placeSudokuDigit(state, SOLUTION[0] as never)
    expect(next).toBe(state)
  })

  it("refreshes every empty cell's candidates via legalCandidates when auto-candidates is on", () => {
    const emptyIndexes = [0, 1, 2, 9]
    const puzzle = buildPuzzle(SOLUTION, emptyIndexes)
    let state = createSudokuGame(puzzle, "daily", { autoCandidates: true, now: 0 })
    state = selectSudokuCell(state, 0)
    state = placeSudokuDigit(state, SOLUTION[0] as never)

    for (let i = 0; i < 81; i++) {
      if (state.cells[i].value === 0) {
        expect(state.cells[i].candidates).toEqual(legalCandidates(state.cells, i))
      } else {
        expect(state.cells[i].candidates).toEqual([])
      }
    }
  })

  it("prunes a peer's candidates once its digit is no longer legal", () => {
    // A carved (real, ambiguous) puzzle is needed here: a full solution with
    // only a couple of cells blanked resolves to naked singles immediately,
    // leaving no genuinely multi-candidate peer to demonstrate pruning on.
    const puzzle = generateSudoku({ difficulty: "medium", seed: 555 })
    let state = createSudokuGame(puzzle, "daily", { autoCandidates: true, now: 0 })

    let placedIndex = -1
    let digit = 0
    let prunablePeer = -1
    for (let i = 0; i < 81 && placedIndex === -1; i++) {
      if (state.cells[i].value !== 0) continue
      for (const candidate of state.cells[i].candidates) {
        const peer = peerIndexes(i).find(
          (p) => state.cells[p].value === 0 && state.cells[p].candidates.includes(candidate),
        )
        if (peer !== undefined) {
          placedIndex = i
          digit = candidate
          prunablePeer = peer
          break
        }
      }
    }
    expect(placedIndex).not.toBe(-1)

    state = selectSudokuCell(state, placedIndex)
    state = placeSudokuDigit(state, digit as never)

    expect(state.cells[prunablePeer].candidates).not.toContain(digit)
  })

  it("does not touch candidates when auto-candidates is off", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1])
    let state = createSudokuGame(puzzle, "daily", { now: 0 })
    state = toggleSudokuCandidate(selectSudokuCell(state, 1), 4 as never)
    const before = state.cells[1].candidates

    state = selectSudokuCell(state, 0)
    state = placeSudokuDigit(state, SOLUTION[0] as never)

    expect(state.cells[1].candidates).toEqual(before)
  })

  it("wins when the final digit completes the solution", () => {
    const emptyIndex = 40
    const puzzle = buildPuzzle(SOLUTION, [emptyIndex])
    let state = createSudokuGame(puzzle, "daily", { now: 0 })
    state = selectSudokuCell(state, emptyIndex)
    state = placeSudokuDigit(state, SOLUTION[emptyIndex] as never)

    expect(state.status).toBe("won")
  })

  it("does not win when the placed digit is wrong", () => {
    const emptyIndex = 40
    const puzzle = buildPuzzle(SOLUTION, [emptyIndex])
    const wrongDigit = (((SOLUTION[emptyIndex] as number) % 9) + 1) as never
    let state = createSudokuGame(puzzle, "daily", { now: 0 })
    state = selectSudokuCell(state, emptyIndex)
    state = placeSudokuDigit(state, wrongDigit)

    expect(state.status).toBe("playing")
  })
})

describe("clearSudokuCell", () => {
  it("clears the value and candidates of the selected non-given cell", () => {
    const index = 4
    const puzzle = buildPuzzle(SOLUTION, [index, 5])
    let state = createSudokuGame(puzzle, "daily", { now: 0 })
    state = selectSudokuCell(state, index)
    state = placeSudokuDigit(state, SOLUTION[index] as never)
    expect(state.status).toBe("playing")
    expect(state.cells[index].value).not.toBe(0)

    state = clearSudokuCell(state)
    expect(state.cells[index].value).toBe(0)
    expect(state.cells[index].candidates).toEqual([])
  })

  it("ignores clearing a given cell", () => {
    const puzzle = buildPuzzle(SOLUTION, [10])
    const state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)
    const next = clearSudokuCell(state)
    expect(next).toBe(state)
  })

  it("refreshes auto-candidates after clearing", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1])
    let state = createSudokuGame(puzzle, "daily", { autoCandidates: true, now: 0 })
    state = selectSudokuCell(state, 0)
    state = placeSudokuDigit(state, SOLUTION[0] as never)
    state = clearSudokuCell(state)

    expect(state.cells[0].value).toBe(0)
    expect(state.cells[0].candidates).toEqual(legalCandidates(state.cells, 0))
  })
})

describe("toggleSudokuCandidate", () => {
  it("adds then removes a candidate mark on an empty cell", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    let state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)

    state = toggleSudokuCandidate(state, 3 as never)
    expect(state.cells[0].candidates).toEqual([3])

    state = toggleSudokuCandidate(state, 3 as never)
    expect(state.cells[0].candidates).toEqual([])
  })

  it("does not set the cell value", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    let state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)
    state = toggleSudokuCandidate(state, 3 as never)
    expect(state.cells[0].value).toBe(0)
  })

  it("ignores a given cell", () => {
    const puzzle = buildPuzzle(SOLUTION, [10])
    const state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)
    const next = toggleSudokuCandidate(state, 3 as never)
    expect(next).toBe(state)
  })

  it("ignores a filled (non-given) cell", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    let state = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)
    state = placeSudokuDigit(state, SOLUTION[0] as never)
    const next = toggleSudokuCandidate(state, 3 as never)
    expect(next).toBe(state)
  })

  it("ignores mutation when the round is not playing", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const playing = selectSudokuCell(createSudokuGame(puzzle, "daily", { now: 0 }), 0)
    const state = { ...playing, status: "won" as const }
    const next = toggleSudokuCandidate(state, 3 as never)
    expect(next).toBe(state)
  })
})

describe("setSudokuAutoCandidates", () => {
  it("fills empty cell candidates immediately when turned on", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1])
    const state = createSudokuGame(puzzle, "daily", { now: 0 })
    const next = setSudokuAutoCandidates(state, true)

    expect(next.autoCandidates).toBe(true)
    expect(next.cells[0].candidates).toEqual(legalCandidates(next.cells, 0))
    expect(next.cells[1].candidates).toEqual(legalCandidates(next.cells, 1))
  })

  it("leaves existing candidates untouched when turned off", () => {
    const puzzle = buildPuzzle(SOLUTION, [0, 1])
    let state = createSudokuGame(puzzle, "daily", { autoCandidates: true, now: 0 })
    const filled = state.cells[0].candidates

    state = setSudokuAutoCandidates(state, false)
    expect(state.autoCandidates).toBe(false)
    expect(state.cells[0].candidates).toEqual(filled)
  })
})

describe("undoSudoku", () => {
  it("is a no-op when the undo stack is empty", () => {
    const state = createSudokuGame(buildPuzzle(SOLUTION, [0]), "daily", { now: 0 })
    expect(undoSudoku(state)).toBe(state)
  })

  it("restores the previous cells snapshot", () => {
    const index = 20
    const puzzle = buildPuzzle(SOLUTION, [index])
    const original = createSudokuGame(puzzle, "daily", { now: 0 })
    let state = selectSudokuCell(original, index)
    state = placeSudokuDigit(state, SOLUTION[index] as never)
    expect(state.cells[index].value).not.toBe(0)

    state = undoSudoku(state)
    expect(state.cells).toEqual(original.cells)
    expect(state.undoStack).toEqual([])
  })

  it("reverts a won round back to playing", () => {
    const index = 40
    const puzzle = buildPuzzle(SOLUTION, [index])
    let state = createSudokuGame(puzzle, "daily", { now: 0 })
    state = selectSudokuCell(state, index)
    state = placeSudokuDigit(state, SOLUTION[index] as never)
    expect(state.status).toBe("won")

    state = undoSudoku(state)
    expect(state.status).toBe("playing")
    expect(state.cells[index].value).toBe(0)
  })
})

describe("recomputeSudokuWin", () => {
  it("marks the round won once every cell matches the solution", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const state = createSudokuGame(puzzle, "daily", { now: 0 })
    const solvedCells = state.cells.map((cell, i) => ({ ...cell, value: SOLUTION[i] }))
    const solved = { ...state, cells: solvedCells }

    expect(recomputeSudokuWin(solved).status).toBe("won")
  })

  it("leaves an incomplete round playing", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const state = createSudokuGame(puzzle, "daily", { now: 0 })
    expect(recomputeSudokuWin(state).status).toBe("playing")
  })

  it("does not re-evaluate a non-playing round", () => {
    const puzzle = buildPuzzle(SOLUTION, [0])
    const state = { ...createSudokuGame(puzzle, "daily", { now: 0 }), status: "abandoned" as const }
    expect(recomputeSudokuWin(state)).toBe(state)
  })
})
