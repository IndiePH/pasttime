import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  createSudokuGame,
  generateSudoku,
  getSudokuStorageKey,
  type SudokuGameState,
} from "@pasttime/domain/games/sudoku"

import { useSudokuGame } from "./use-sudoku-game"

const mockGenerateSudokuInWorker = vi.fn()

vi.mock("../lib/generate-sudoku.client", () => ({
  generateSudokuInWorker: (...args: unknown[]) => mockGenerateSudokuInWorker(...args),
}))

// ---------------------------------------------------------------------------
// Mock @/infrastructure/storage with a simple Map so we can inspect persisted
// values and seed storage for the reload/hydrate test.
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

// A fixed, real puzzle (deterministic seed) so puzzle/solution shapes are
// always valid without needing to stub the domain generator's internals.
const FIXTURE_PUZZLE = generateSudoku({ difficulty: "easy", seed: 1 })

function buildPlayingState(mode: "daily" | "random" = "random"): SudokuGameState {
  return createSudokuGame(FIXTURE_PUZZLE, mode, { now: Date.now() })
}

/** A state one correct digit away from solved, with that cell selected. */
function buildNearWinState(mode: "daily" | "random" = "random"): {
  state: SudokuGameState
  missingDigit: number
} {
  const base = buildPlayingState(mode)
  const missingIndex = base.cells.findIndex((cell) => !cell.given)
  const cells = base.cells.map((cell, i) => {
    if (cell.given || i === missingIndex) return cell
    return { ...cell, value: FIXTURE_PUZZLE.solution[i] }
  })
  return {
    state: { ...base, cells, selectedIndex: missingIndex },
    missingDigit: FIXTURE_PUZZLE.solution[missingIndex],
  }
}

const DAILY_KEY = getSudokuStorageKey("easy", "daily")
const RANDOM_KEY = getSudokuStorageKey("easy", "random")

async function mountReady(mode: "daily" | "random" = "random") {
  const hook = renderHook(() => useSudokuGame("easy", mode))
  await waitFor(() => expect(hook.result.current.status).toBe("ready"))
  return hook
}

describe("useSudokuGame — generation + hydration", () => {
  beforeEach(() => {
    storageMap.clear()
    mockGenerateSudokuInWorker.mockReset()
    mockGenerateSudokuInWorker.mockResolvedValue(FIXTURE_PUZZLE)
  })

  it("generates a puzzle via the worker helper when nothing is stored (random mode)", async () => {
    const { result } = await mountReady("random")

    expect(mockGenerateSudokuInWorker).toHaveBeenCalledTimes(1)
    expect(mockGenerateSudokuInWorker).toHaveBeenCalledWith("easy", expect.any(Number))
    expect(result.current.state?.puzzle).toEqual(FIXTURE_PUZZLE)
    expect(result.current.error).toBeNull()
  })

  it("uses the daily seed (getDailySeed) when generating for daily mode", async () => {
    await mountReady("daily")
    expect(mockGenerateSudokuInWorker).toHaveBeenCalledTimes(1)
    const [difficultyArg, seedArg] = mockGenerateSudokuInWorker.mock.calls[0] as [string, number]
    expect(difficultyArg).toBe("easy")
    // getDailySeed produces an 8-digit YYYYMMDD-shaped integer.
    expect(seedArg).toBeGreaterThan(10_000_000)
  })

  it("draws the random-mode seed from crypto.getRandomValues", async () => {
    const spy = vi.spyOn(globalThis.crypto, "getRandomValues")
    await mountReady("random")
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("persists the newly generated puzzle under the storage key for BOTH daily and random modes", async () => {
    await mountReady("random")
    expect(storageMap.has(RANDOM_KEY)).toBe(true)

    storageMap.clear()
    await mountReady("daily")
    expect(storageMap.has(DAILY_KEY)).toBe(true)
  })

  it("hydrates from a valid stored state instead of calling generate", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)

    const { result } = await mountReady("random")

    expect(mockGenerateSudokuInWorker).not.toHaveBeenCalled()
    expect(result.current.state).toEqual(stored)
  })

  it("ignores corrupt stored state and falls back to generation", async () => {
    storageMap.set(RANDOM_KEY, { not: "a valid game" })

    const { result } = await mountReady("random")

    expect(mockGenerateSudokuInWorker).toHaveBeenCalledTimes(1)
    expect(result.current.state?.puzzle).toEqual(FIXTURE_PUZZLE)
  })
})

describe("useSudokuGame — generation failure + retry", () => {
  beforeEach(() => {
    storageMap.clear()
    mockGenerateSudokuInWorker.mockReset()
  })

  it("sets status to 'error' and does not persist anything when generation fails", async () => {
    mockGenerateSudokuInWorker.mockRejectedValue(new Error("worker exploded"))

    const { result } = renderHook(() => useSudokuGame("easy", "random"))
    await waitFor(() => expect(result.current.status).toBe("error"))

    expect(result.current.error).toBe("worker exploded")
    expect(result.current.state).toBeNull()
    expect(storageMap.has(RANDOM_KEY)).toBe(false)
  })

  it("retry() bumps the retry counter and re-attempts generation", async () => {
    mockGenerateSudokuInWorker.mockRejectedValueOnce(new Error("first failure"))
    mockGenerateSudokuInWorker.mockResolvedValueOnce(FIXTURE_PUZZLE)

    const { result } = renderHook(() => useSudokuGame("easy", "random"))
    await waitFor(() => expect(result.current.status).toBe("error"))

    act(() => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.status).toBe("ready"))
    expect(mockGenerateSudokuInWorker).toHaveBeenCalledTimes(2)
    expect(result.current.state?.puzzle).toEqual(FIXTURE_PUZZLE)
  })
})

describe("useSudokuGame — mutations + persistence", () => {
  beforeEach(() => {
    storageMap.clear()
    mockGenerateSudokuInWorker.mockReset()
    mockGenerateSudokuInWorker.mockResolvedValue(FIXTURE_PUZZLE)
  })

  it("persists after every state change in RANDOM mode too (endless resumes, unlike crossword)", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    const emptyIndex = result.current.state!.cells.findIndex((cell) => !cell.given)
    act(() => {
      result.current.selectCell(emptyIndex)
    })
    act(() => {
      result.current.placeDigit(1 as never)
    })

    const persisted = storageMap.get(RANDOM_KEY) as SudokuGameState
    expect(persisted.cells[emptyIndex].value).toBe(1)
  })

  it("selectCell + placeDigit fills the selected cell with the given digit", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    const emptyIndex = stored.cells.findIndex((cell) => !cell.given)
    act(() => {
      result.current.selectCell(emptyIndex)
    })
    act(() => {
      result.current.placeDigit(FIXTURE_PUZZLE.solution[emptyIndex] as never)
    })

    expect(result.current.state!.cells[emptyIndex].value).toBe(
      FIXTURE_PUZZLE.solution[emptyIndex],
    )
  })

  it("placeDigit marks a candidate instead of a value when candidateMode is on", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    const emptyIndex = stored.cells.findIndex((cell) => !cell.given)
    act(() => {
      result.current.selectCell(emptyIndex)
      result.current.toggleCandidateMode()
    })
    act(() => {
      result.current.placeDigit(4 as never)
    })

    expect(result.current.state!.cells[emptyIndex].value).toBe(0)
    expect(result.current.state!.cells[emptyIndex].candidates).toContain(4)
  })

  it("clearCell empties a filled non-given cell", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    const emptyIndex = stored.cells.findIndex((cell) => !cell.given)
    act(() => {
      result.current.selectCell(emptyIndex)
      result.current.placeDigit(FIXTURE_PUZZLE.solution[emptyIndex] as never)
    })
    expect(result.current.state!.cells[emptyIndex].value).not.toBe(0)

    act(() => {
      result.current.clearCell()
    })
    expect(result.current.state!.cells[emptyIndex].value).toBe(0)
  })

  it("undo restores the previous cells snapshot", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    const emptyIndex = stored.cells.findIndex((cell) => !cell.given)
    act(() => {
      result.current.selectCell(emptyIndex)
      result.current.placeDigit(FIXTURE_PUZZLE.solution[emptyIndex] as never)
    })
    expect(result.current.state!.cells[emptyIndex].value).not.toBe(0)

    act(() => {
      result.current.undo()
    })
    expect(result.current.state!.cells[emptyIndex].value).toBe(0)
  })

  it("setAutoCandidates(true) fills legal candidates into empty cells", async () => {
    const stored = buildPlayingState("random")
    storageMap.set(RANDOM_KEY, stored)
    const { result } = await mountReady("random")

    act(() => {
      result.current.setAutoCandidates(true)
    })

    const emptyIndex = result.current.state!.cells.findIndex((cell) => !cell.given)
    expect(result.current.state!.cells[emptyIndex].candidates.length).toBeGreaterThan(0)
  })
})

describe("useSudokuGame — win + engagement + timer", () => {
  beforeEach(() => {
    storageMap.clear()
    mockGenerateSudokuInWorker.mockReset()
    mockGenerateSudokuInWorker.mockResolvedValue(FIXTURE_PUZZLE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("completing the puzzle transitions status to 'won' and persists it", async () => {
    const { state, missingDigit } = buildNearWinState("random")
    storageMap.set(RANDOM_KEY, state)
    const { result } = await mountReady("random")

    act(() => {
      result.current.placeDigit(missingDigit as never)
    })

    expect(result.current.state!.status).toBe("won")
    const persisted = storageMap.get(RANDOM_KEY) as SudokuGameState
    expect(persisted.status).toBe("won")
  })

  it("records a daily engagement completion on win, variant=difficulty", async () => {
    const dailyNearWin = buildNearWinState("daily")
    storageMap.set(DAILY_KEY, dailyNearWin.state)
    const { result: dailyResult } = await mountReady("daily")

    act(() => {
      dailyResult.current.placeDigit(dailyNearWin.missingDigit as never)
    })

    await waitFor(() => {
      const completions = storageMap.get("sudoku:daily:completions") as unknown[] | undefined
      expect(completions?.length).toBe(1)
    })
  })

  it("elapsedMs increases every second while playing, then freezes on win", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-19T00:00:00.000Z"))

    const { state, missingDigit } = buildNearWinState("random")
    storageMap.set(RANDOM_KEY, state)

    const { result } = renderHook(() => useSudokuGame("easy", "random"))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(result.current.status).toBe("ready")

    const elapsedBefore = result.current.elapsedMs

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(elapsedBefore + 3000)

    const elapsedAtWinTime = result.current.elapsedMs
    act(() => {
      result.current.placeDigit(missingDigit as never)
    })
    expect(result.current.state!.status).toBe("won")
    const frozenElapsed = result.current.elapsedMs
    expect(frozenElapsed).toBeGreaterThanOrEqual(elapsedAtWinTime)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    // Elapsed no longer advances once the round is won.
    expect(result.current.elapsedMs).toBe(frozenElapsed)
  })
})
