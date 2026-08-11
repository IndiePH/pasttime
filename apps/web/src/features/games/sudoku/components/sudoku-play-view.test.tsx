import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"
import type {
  SudokuGameState,
  SudokuPuzzle,
  SudokuRoundMode,
} from "@pasttime/domain/games/sudoku"

import { SudokuPlayPreferencesProvider } from "@/features/games/sudoku/context/sudoku-play-preferences-context"
import {
  formatSudokuElapsed,
  SudokuPlaySessionReady,
} from "./sudoku-play-view"

// ---------------------------------------------------------------------------
// Mock @/infrastructure/storage with a simple Map, same pattern as the
// sibling crossword/word-guess play-view and sudoku hook tests.
// ---------------------------------------------------------------------------
const storageMap = new Map<string, unknown>()

vi.mock("@/infrastructure/storage", () => ({
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
}))

const MOCK_GAME: GameDefinition = {
  id: "sudoku",
  title: "Sudoku",
  description: "Test game",
  status: "available",
  icon: "sudoku",
  tags: [],
}

/** A valid Latin-square solution (each row/col/3x3 box has 1-9 once). */
const SOLVED_GRID = [
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  4, 5, 6, 7, 8, 9, 1, 2, 3,
  7, 8, 9, 1, 2, 3, 4, 5, 6,
  2, 3, 4, 5, 6, 7, 8, 9, 1,
  5, 6, 7, 8, 9, 1, 2, 3, 4,
  8, 9, 1, 2, 3, 4, 5, 6, 7,
  3, 4, 5, 6, 7, 8, 9, 1, 2,
  6, 7, 8, 9, 1, 2, 3, 4, 5,
  9, 1, 2, 3, 4, 5, 6, 7, 8,
]

const PUZZLE: SudokuPuzzle = {
  givens: new Array(81).fill(0),
  solution: SOLVED_GRID,
  difficulty: "easy",
  seed: 1,
  ratingTechnique: "naked-single",
}

function buildState(
  mode: SudokuRoundMode,
  status: SudokuGameState["status"],
): SudokuGameState {
  const won = status === "won"
  return {
    puzzle: PUZZLE,
    cells: SOLVED_GRID.map((solutionValue) => ({
      given: false,
      value: won ? solutionValue : 0,
      candidates: [],
    })),
    status,
    mode,
    difficulty: "easy",
    candidateMode: false,
    autoCandidates: false,
    selectedIndex: null,
    undoStack: [],
    startedAt: Date.now(),
    elapsedMs: 12_000,
  }
}

function renderSession(mode: SudokuRoundMode, status: SudokuGameState["status"]) {
  return render(
    <SudokuPlayPreferencesProvider>
      <SudokuPlaySessionReady
        game={MOCK_GAME}
        modeLabel="Test"
        difficulty="easy"
        mode={mode}
        state={buildState(mode, status)}
        elapsedMs={12_000}
        selectCell={vi.fn()}
        placeDigit={vi.fn()}
        clearCell={vi.fn()}
        toggleCandidateMode={vi.fn()}
        setAutoCandidates={vi.fn()}
        undo={vi.fn()}
      />
    </SudokuPlayPreferencesProvider>,
  )
}

afterEach(() => {
  cleanup()
  storageMap.clear()
})

describe("SudokuPlaySessionReady — win-state CTAs", () => {
  it("random mode, playing: no win banner, footer has New game + Back to setup", () => {
    renderSession("random", "playing")

    expect(screen.queryByText(/Solved in/)).not.toBeInTheDocument()
    expect(screen.queryByText("View stats")).not.toBeInTheDocument()

    expect(screen.getByRole("button", { name: "New game" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to setup" })).toBeInTheDocument()
  })

  it("random mode, won: exactly one CTA group — no duplicate New game/Back-to-setup pair in the banner", () => {
    renderSession("random", "won")

    expect(screen.getByText(/Solved in/)).toBeInTheDocument()

    // Single "View stats" link lives in the win banner.
    expect(screen.getByRole("link", { name: "View stats" })).toBeInTheDocument()

    // Exactly one "New game" (footer) — no "New endless" duplicate in the banner.
    expect(screen.getAllByRole("button", { name: "New game" })).toHaveLength(1)
    expect(screen.queryByRole("button", { name: "New endless" })).not.toBeInTheDocument()

    // Exactly one "Back to setup" (footer) — no "Back to launch" duplicate.
    expect(screen.getAllByRole("link", { name: "Back to setup" })).toHaveLength(1)
    expect(screen.queryByRole("link", { name: "Back to launch" })).not.toBeInTheDocument()
  })

  it("daily mode, won: opens results dialog, View stats in dialog, no replay CTA", () => {
    renderSession("daily", "won")

    expect(screen.getAllByText(/Solved in/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole("dialog", { name: "Nice work!" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View stats" })).toBeInTheDocument()

    expect(screen.queryByRole("button", { name: "New game" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "New endless" })).not.toBeInTheDocument()
  })
})

describe("formatSudokuElapsed", () => {
  it("formats sub-hour durations as m:ss", () => {
    expect(formatSudokuElapsed(0)).toBe("0:00")
    expect(formatSudokuElapsed(5_000)).toBe("0:05")
    expect(formatSudokuElapsed(65_000)).toBe("1:05")
    expect(formatSudokuElapsed(59 * 60_000 + 59_000)).toBe("59:59")
  })

  it("formats durations at/over an hour as h:mm:ss", () => {
    expect(formatSudokuElapsed(60 * 60_000)).toBe("1:00:00")
    expect(formatSudokuElapsed(60 * 60_000 + 61_000)).toBe("1:01:01")
  })

  it("clamps negative durations to zero", () => {
    expect(formatSudokuElapsed(-1_000)).toBe("0:00")
  })
})
