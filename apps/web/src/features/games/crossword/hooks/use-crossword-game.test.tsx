import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { CrosswordGameState } from "@pasttime/domain/games/crossword"

import { useCrosswordGame } from "./use-crossword-game"

const mockCreateHydratedCrosswordGameState = vi.fn()

vi.mock("@/lib/lexicon/crossword-state", () => ({
  createHydratedCrosswordGameState: (...args: unknown[]) =>
    mockCreateHydratedCrosswordGameState(...args),
}))

// ---------------------------------------------------------------------------
// Mock @/infrastructure/storage with a simple Map so we can inspect persisted
// values and seed storage for the reload test.
// ---------------------------------------------------------------------------
const storageMap = new Map<string, unknown>()

vi.mock("@/infrastructure/storage", () => {
  return {
    useStorage: () => ({
      get: <T,>(key: string) => (storageMap.get(key) as T) ?? null,
      set: <T,>(key: string, value: T) => {
        storageMap.set(key, value)
      },
      remove: (key: string) => {
        storageMap.delete(key)
      },
      clear: () => {
        storageMap.clear()
      },
    }),
  }
})

// ---------------------------------------------------------------------------
// Hand-built 5×5 crossword puzzle used by every test fixture.
//
//   Row 0: [L][L][L][L][L]   ← 1-across "FIRST" (cover cols 0-4)
//   Row 1: [L][B][B][B][B]   ←   only-down part of 1-down "FINAL"
//   Row 2: [L][B][B][B][B]   ←   only-down
//   Row 3: [L][B][B][B][B]
//   Row 4: [L][B][B][B][B]
//   ↑
//   1-down "FINAL" (cover rows 0-4 in col 0)
//
// Cell (0,0): both 1-across + 1-down  → across-first
// Cell (1,0): only 1-down             → flips direction to "down"
// Cell (0,1): only 1-across           → no flip
// ---------------------------------------------------------------------------
function buildTestGameState(
  activeCell?: { row: number; col: number },
): CrosswordGameState {
  return {
    puzzle: {
      id: "test-puzzle-5",
      grid: [
        [
          { type: "letter", row: 0, col: 0, clueNumber: 1, answerLetter: "F" },
          { type: "letter", row: 0, col: 1, answerLetter: "I" },
          { type: "letter", row: 0, col: 2, answerLetter: "R" },
          { type: "letter", row: 0, col: 3, answerLetter: "S" },
          { type: "letter", row: 0, col: 4, answerLetter: "T" },
        ],
        [
          { type: "letter", row: 1, col: 0, answerLetter: "I" },
          { type: "block", row: 1, col: 1 },
          { type: "block", row: 1, col: 2 },
          { type: "block", row: 1, col: 3 },
          { type: "block", row: 1, col: 4 },
        ],
        [
          { type: "letter", row: 2, col: 0, answerLetter: "N" },
          { type: "block", row: 2, col: 1 },
          { type: "block", row: 2, col: 2 },
          { type: "block", row: 2, col: 3 },
          { type: "block", row: 2, col: 4 },
        ],
        [
          { type: "letter", row: 3, col: 0, answerLetter: "A" },
          { type: "block", row: 3, col: 1 },
          { type: "block", row: 3, col: 2 },
          { type: "block", row: 3, col: 3 },
          { type: "block", row: 3, col: 4 },
        ],
        [
          { type: "letter", row: 4, col: 0, answerLetter: "L" },
          { type: "block", row: 4, col: 1 },
          { type: "block", row: 4, col: 2 },
          { type: "block", row: 4, col: 3 },
          { type: "block", row: 4, col: 4 },
        ],
      ],
      across: [
        {
          id: "1-across",
          number: 1,
          direction: "across",
          text: "First",
          answer: "FIRST",
          row: 0,
          col: 0,
        },
      ],
      down: [
        {
          id: "1-down",
          number: 1,
          direction: "down",
          text: "Ultimate",
          answer: "FINAL",
          row: 0,
          col: 0,
        },
      ],
    },
    inputs: {},
    activeCell,
    status: "playing",
  }
}

// The storage key the hook constructs for (15, "random").
const STORAGE_KEY = "crossword:15:random"

// ---------------------------------------------------------------------------
// Helper: mount the hook inside renderHook and return the result + helpers.
// ---------------------------------------------------------------------------
async function mountHook(initialState?: CrosswordGameState) {
  if (initialState) {
    storageMap.set(STORAGE_KEY, initialState)
  }
  const hook = renderHook(() => useCrosswordGame(15, "random"))
  await waitFor(() => expect(hook.result.current.loadStatus).toBe("ready"))
  return hook
}

async function mountReadyHook(initialState?: CrosswordGameState) {
  return mountHook(initialState)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useCrosswordGame — direction + activeClue", () => {
  beforeEach(() => {
    storageMap.clear()
    mockCreateHydratedCrosswordGameState.mockResolvedValue(buildTestGameState())
  })

  // ---- Initialisation ----------------------------------------------------

  it("initialises direction to 'across' when there is no activeCell", async () => {
    const { result } = await mountReadyHook()
    expect(result.current.direction).toBe("across")
  })

  it("initialises direction via across-first when activeCell exists", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)
    // Cell (0,0) has both an across and down word → across-first → "across"
    expect(result.current.direction).toBe("across")
  })

  it("initialises direction to the only available word when activeCell is only-down", async () => {
    const seed = buildTestGameState({ row: 1, col: 0 })
    const { result } = await mountHook(seed)
    // Cell (1,0) is only in the down clue → resolves to "down"
    expect(result.current.direction).toBe("down")
  })

  it("returns activeClue = null when there is no activeCell", async () => {
    const { result } = await mountHook()
    expect(result.current.activeClue).toBeNull()
  })

  it("returns the correct activeClue when activeCell + direction resolve", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)
    expect(result.current.activeClue).not.toBeNull()
    expect(result.current.activeClue!.id).toBe("1-across")
    expect(result.current.activeClue!.text).toBe("First")
  })

  // ---- setActiveCell — across-first (D-03) --------------------------------

  it("keeps direction 'across' when cell has both across and down (D-03)", async () => {
    const seed = buildTestGameState()
    const { result } = await mountHook(seed)
    act(() => {
      result.current.setActiveCell({ row: 0, col: 0 })
    })
    // (0,0) belongs to both directions → resolveDirection keeps "across"
    expect(result.current.direction).toBe("across")
    expect(result.current.activeClue).not.toBeNull()
    expect(result.current.activeClue!.id).toBe("1-across")
  })

  it("flips direction to 'down' when cell is only-down (D-03)", async () => {
    const seed = buildTestGameState()
    const { result } = await mountHook(seed)
    act(() => {
      result.current.setActiveCell({ row: 1, col: 0 })
    })
    // (1,0) is only part of the down clue → resolveDirection returns "down"
    expect(result.current.direction).toBe("down")
    expect(result.current.activeClue).not.toBeNull()
    expect(result.current.activeClue!.id).toBe("1-down")
    expect(result.current.activeClue!.text).toBe("Ultimate")
  })

  it("keeps current direction when cell is only-across", async () => {
    const seed = buildTestGameState()
    const { result } = await mountHook(seed)
    // Start by clicking a both-direction cell → direction is "across"
    act(() => {
      result.current.setActiveCell({ row: 0, col: 0 })
    })
    expect(result.current.direction).toBe("across")

    // Now click a cell that only has across
    act(() => {
      result.current.setActiveCell({ row: 0, col: 1 })
    })
    expect(result.current.direction).toBe("across")
  })

  // ---- setDirection ------------------------------------------------------

  it("setDirection('down') flips direction and updates activeClue", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)
    expect(result.current.direction).toBe("across")
    expect(result.current.activeClue!.id).toBe("1-across")

    act(() => {
      result.current.setDirection("down")
    })
    expect(result.current.direction).toBe("down")
    expect(result.current.activeClue).not.toBeNull()
    expect(result.current.activeClue!.id).toBe("1-down")
  })

  it("setDirection('across') flips back and updates activeClue", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)

    act(() => {
      result.current.setDirection("down")
    })
    expect(result.current.direction).toBe("down")

    act(() => {
      result.current.setDirection("across")
    })
    expect(result.current.direction).toBe("across")
    expect(result.current.activeClue!.id).toBe("1-across")
  })

  it("returns activeClue = null when activeCell is null, regardless of direction", async () => {
    const { result } = await mountHook()
    act(() => {
      result.current.setDirection("down")
    })
    expect(result.current.activeClue).toBeNull()

    act(() => {
      result.current.setDirection("across")
    })
    expect(result.current.activeClue).toBeNull()
  })

  // ---- Reload re-derivation (D-09) ---------------------------------------

  it("re-derives direction to across-first on reload from persisted activeCell (D-09)", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result: first, unmount } = await mountHook(seed)

    // Switch to down before unmount
    act(() => {
      first.current.setDirection("down")
    })
    expect(first.current.direction).toBe("down")

    unmount()

    // Re-mount — the hook reads the persisted gameState which still has
    // activeCell = (0,0) but direction is NOT persisted → re-derived
    const { result: second } = await mountHook()
    expect(second.current.direction).toBe("across")
    expect(second.current.activeClue).not.toBeNull()
    expect(second.current.activeClue!.id).toBe("1-across")
  })

  it("re-derives to the only available direction when persisted activeCell is only-down (D-09)", async () => {
    const seed = buildTestGameState({ row: 1, col: 0 })
    ;(await mountHook(seed)).unmount()

    const { result } = await mountHook()
    // Cell (1,0) only has a down word → resolves to "down"
    expect(result.current.direction).toBe("down")
    expect(result.current.activeClue!.id).toBe("1-down")
  })

  // ---- D-09 — direction/activeClue NOT persisted -------------------------

  it("does NOT persist direction or activeClue in storage (D-09)", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    ;(await mountHook(seed)).unmount()

    const persisted = storageMap.get(STORAGE_KEY) as Record<string, unknown>
    expect(persisted).not.toHaveProperty("direction")
    expect(persisted).not.toHaveProperty("activeClue")
    // gameState itself is still persisted
    expect(persisted).toHaveProperty("puzzle")
    expect(persisted).toHaveProperty("inputs")
    expect(persisted).toHaveProperty("status")
    expect(persisted).toHaveProperty("activeCell")
  })

  // ---- setActiveCell with null (deselect) --------------------------------

  it("sets activeClue to null when setActiveCell(null) is called", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)
    expect(result.current.activeClue).not.toBeNull()

    act(() => {
      result.current.setActiveCell(null)
    })
    expect(result.current.activeClue).toBeNull()
    // direction should remain unchanged when cell is null
    expect(result.current.direction).toBe("across")
  })

  // ---- updateInput does not affect direction/activeClue -------------------

  it("updateInput does not change direction or activeClue", async () => {
    const seed = buildTestGameState({ row: 0, col: 0 })
    const { result } = await mountHook(seed)
    const initialDirection = result.current.direction
    const initialClueId = result.current.activeClue!.id

    act(() => {
      result.current.updateInput(0, 0, "F")
    })

    expect(result.current.direction).toBe(initialDirection)
    expect(result.current.activeClue!.id).toBe(initialClueId)
  })
})

// ---------------------------------------------------------------------------
// mode-awareness: persistence (D-16)
// ---------------------------------------------------------------------------
describe("mode-awareness: persistence", () => {
  beforeEach(() => {
    storageMap.clear()
    mockCreateHydratedCrosswordGameState.mockResolvedValue(buildTestGameState())
  })

  it("calls storage.set for daily mode after a state change (D-16)", async () => {
    const spy = vi.spyOn(storageMap, "set")
    const { result } = renderHook(() => useCrosswordGame(15, "daily"))
    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))
    spy.mockClear() // clear initial mount persistence

    // Find the first letter cell in the generated puzzle
    const grid = result.current.gameState!.puzzle.grid
    const letterRow = grid.findIndex((row) =>
      row.some((c) => c.type === "letter"),
    )
    const letterCol = grid[letterRow].findIndex(
      (c) => c.type === "letter",
    )

    act(() => {
      result.current.updateInput(letterRow, letterCol, "A")
    })

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("does NOT call storage.set for random mode after a state change — ephemeral (D-16)", async () => {
    const spy = vi.spyOn(storageMap, "set")
    const { result } = renderHook(() => useCrosswordGame(15, "random"))
    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))
    spy.mockClear() // clear initial mount persistence

    const grid = result.current.gameState!.puzzle.grid
    const letterRow = grid.findIndex((row) =>
      row.some((c) => c.type === "letter"),
    )
    const letterCol = grid[letterRow].findIndex(
      (c) => c.type === "letter",
    )

    act(() => {
      result.current.updateInput(letterRow, letterCol, "A")
    })

    // Currently this FAILS because the hook persists for random mode (RED)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// mode-awareness: newPuzzle (D-14)
// ---------------------------------------------------------------------------
describe("mode-awareness: newPuzzle", () => {
  beforeEach(() => {
    storageMap.clear()
    mockCreateHydratedCrosswordGameState.mockResolvedValue(buildTestGameState())
  })

  it("daily mode: resets inputs but keeps the same puzzle (D-14)", async () => {
    const { result } = renderHook(() => useCrosswordGame(15, "daily"))
    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))

    const puzzleIdBefore = result.current.gameState!.puzzle.id

    // Set some inputs first
    const grid = result.current.gameState!.puzzle.grid
    const letterRow = grid.findIndex((row) =>
      row.some((c) => c.type === "letter"),
    )
    const letterCol = grid[letterRow].findIndex(
      (c) => c.type === "letter",
    )

    act(() => {
      result.current.updateInput(letterRow, letterCol, "A")
    })
    expect(
      Object.keys(result.current.gameState!.inputs).length,
    ).toBeGreaterThan(0)

    // Call newPuzzle
    act(() => {
      result.current.newPuzzle()
    })

    // Puzzle should be the same (same seed — daily mode is deterministic)
    expect(result.current.gameState!.puzzle.id).toBe(puzzleIdBefore)
    // Inputs should be reset
    expect(result.current.gameState!.inputs).toEqual({})
    // Status should be "playing"
    expect(result.current.gameState!.status).toBe("playing")
  })

  it("endless mode: generates a fresh puzzle (D-14)", async () => {
    mockCreateHydratedCrosswordGameState
      .mockResolvedValueOnce(buildTestGameState())
      .mockResolvedValueOnce({
        ...buildTestGameState(),
        puzzle: { ...buildTestGameState().puzzle, id: "test-puzzle-5b" },
      })
    const { result } = renderHook(() => useCrosswordGame(15, "random"))
    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))

    const puzzleIdBefore = result.current.gameState!.puzzle.id

    act(() => {
      result.current.newPuzzle()
    })

    await waitFor(() => {
      expect(result.current.gameState!.puzzle.id).not.toBe(puzzleIdBefore)
    })
    // Inputs should be empty fresh state
    expect(result.current.gameState!.inputs).toEqual({})
    expect(result.current.gameState!.status).toBe("playing")
  })

  it("newPuzzle fires synchronously in both modes (no confirmation dialog — D-13)", async () => {
    const { result: daily } = renderHook(() =>
      useCrosswordGame(15, "daily"),
    )
    const { result: endless } = renderHook(() =>
      useCrosswordGame(15, "random"),
    )
    await waitFor(() => expect(daily.current.loadStatus).toBe("ready"))
    await waitFor(() => expect(endless.current.loadStatus).toBe("ready"))

    // newPuzzle must not return a promise — capture direct return value
    let dailyReturn: unknown
    let endlessReturn: unknown
    await act(() => {
      dailyReturn = daily.current.newPuzzle()
      endlessReturn = endless.current.newPuzzle()
    })

    expect(dailyReturn).toBeUndefined()
    expect(endlessReturn).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// mode-awareness: dailyRolloverDetected
// ---------------------------------------------------------------------------
describe("mode-awareness: dailyRolloverDetected", () => {
  beforeEach(() => {
    storageMap.clear()
    mockCreateHydratedCrosswordGameState.mockResolvedValue(buildTestGameState())
  })

  it("returns dailyRolloverDetected initially false", async () => {
    const { result } = renderHook(() => useCrosswordGame(15, "daily"))
    await waitFor(() => expect(result.current.loadStatus).toBe("ready"))
    expect(result.current.dailyRolloverDetected).toBe(false)
  })
})
