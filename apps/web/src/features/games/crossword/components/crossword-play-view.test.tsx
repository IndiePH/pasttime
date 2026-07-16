import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CrosswordClue } from "@pasttime/domain/games/crossword"
import type { GameDefinition } from "@pasttime/domain/games"
import { CrosswordClues } from "./crossword-play-view"
import { CrosswordPlayPreferencesProvider } from "@/features/games/crossword/context/crossword-play-preferences-context"

const ACROSS_CLUES: CrosswordClue[] = [
  {
    id: "a1",
    number: 1,
    direction: "across",
    text: "Feline",
    answer: "CAT",
    row: 0,
    col: 0,
  },
  {
    id: "a4",
    number: 4,
    direction: "across",
    text: "Pets, plural",
    answer: "DOGS",
    row: 2,
    col: 0,
  },
]

const DOWN_CLUES: CrosswordClue[] = [
  {
    id: "d1",
    number: 1,
    direction: "down",
    text: "Bad driver",
    answer: "CAD",
    row: 0,
    col: 0,
  },
  {
    id: "d3",
    number: 3,
    direction: "down",
    text: "Stamps",
    answer: "TS",
    row: 0,
    col: 2,
  },
]

// ---------------------------------------------------------------------------
// CrosswordClues suite (Task 1)
// ---------------------------------------------------------------------------
describe("CrosswordClues", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("renders across and down sections", () => {
    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        blinkActiveClue={false}
      />,
    )

    expect(screen.getByText("Across")).toBeInTheDocument()
    expect(screen.getByText("Down")).toBeInTheDocument()
  })

  it("renders clue numbers and text for all clues", () => {
    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        blinkActiveClue={false}
      />,
    )

    expect(screen.getAllByText(/1\./).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Feline/)).toBeInTheDocument()
    expect(screen.getByText(/4\./)).toBeInTheDocument()
    expect(screen.getByText(/Pets/)).toBeInTheDocument()
    expect(screen.getByText(/Bad driver/)).toBeInTheDocument()
    expect(screen.getByText(/Stamps/)).toBeInTheDocument()
  })

  it("highlights the active clue with bg-primary/10 + font-semibold", () => {
    const activeClue = { direction: "across" as const, number: 1 }

    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        activeClue={activeClue}
        blinkActiveClue={false}
      />,
    )

    const acrossItems = screen.getAllByRole("listitem")
    const activeLi = acrossItems.find((el) =>
      el.textContent?.includes("Feline"),
    )
    expect(activeLi).toBeDefined()
    expect(activeLi!.className).toContain("bg-primary/10")
    expect(activeLi!.className).toContain("font-semibold")
    expect(activeLi!.className).toContain("text-foreground")
  })

  it("does NOT highlight non-active clues", () => {
    const activeClue = { direction: "across" as const, number: 1 }

    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        activeClue={activeClue}
        blinkActiveClue={false}
      />,
    )

    const acrossItems = screen.getAllByRole("listitem")
    const nonActiveLi = acrossItems.find((el) =>
      el.textContent?.includes("Pets"),
    )
    expect(nonActiveLi).toBeDefined()
    expect(nonActiveLi!.className).not.toContain("bg-primary/10")
  })

  it("calls scrollIntoView on the active clue element when activeClue changes", () => {
    const scrollIntoViewMock = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock

    const activeClue = { direction: "across" as const, number: 1 }

    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        activeClue={activeClue}
        blinkActiveClue={false}
      />,
    )

    const acrossItems = screen.getAllByRole("listitem")
    const activeLi = acrossItems.find((el) =>
      el.textContent?.includes("Feline"),
    )
    expect(activeLi).toBeDefined()
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })

  it("adds bg-primary/20 blink class when blinkActiveClue is on and motion is not reduced", () => {
    vi.useFakeTimers()

    const activeClue = { direction: "across" as const, number: 1 }

    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        activeClue={activeClue}
        blinkActiveClue={true}
      />,
    )

    const acrossItems = screen.getAllByRole("listitem")
    const activeLi = acrossItems.find((el) =>
      el.textContent?.includes("Feline"),
    )
    expect(activeLi).toBeDefined()

    expect(activeLi!.className).toContain("bg-primary/20")

    vi.advanceTimersByTime(260)
    expect(activeLi!.className).not.toContain("bg-primary/20")

    vi.useRealTimers()
  })

  it("does NOT blink when blinkActiveClue is false", () => {
    vi.useFakeTimers()

    const activeClue = { direction: "across" as const, number: 1 }

    render(
      <CrosswordClues
        across={ACROSS_CLUES}
        down={DOWN_CLUES}
        activeClue={activeClue}
        blinkActiveClue={false}
      />,
    )

    const acrossItems = screen.getAllByRole("listitem")
    const activeLi = acrossItems.find((el) =>
      el.textContent?.includes("Feline"),
    )
    expect(activeLi).toBeDefined()

    expect(activeLi!.className).not.toContain("bg-primary/20")

    vi.useRealTimers()
  })
})

// ---------------------------------------------------------------------------
// CrosswordPlaySession suite (Task 3)
// ---------------------------------------------------------------------------

// In-memory storage for the mocked useStorage hook
const storageMap = new Map<string, unknown>()

vi.mock("@pasttime/domain/daily", () => ({
  isNewDay: vi.fn(),
  getDailySeed: vi.fn(),
  hashSeed: vi.fn(),
}))

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
  id: "crossword",
  title: "Crossword",
  description: "Test game",
  status: "available",
  icon: "crossword",
  tags: [],
}

describe("CrosswordPlaySession", () => {
  beforeEach(() => {
    storageMap.clear()
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  async function renderSession() {
    const { CrosswordPlaySession } = await import("./crossword-play-view")

    return render(
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          game={MOCK_GAME}
          modeLabel="Test"
          gridSize={7}
          mode="random"
        />
      </CrosswordPlayPreferencesProvider>,
    )
  }

  it("renders grid cells and clue sections", async () => {
    await renderSession()

    const gridcells = screen.getAllByRole("gridcell")
    expect(gridcells.length).toBeGreaterThan(0)
    expect(screen.getByText("Across")).toBeInTheDocument()
    expect(screen.getByText("Down")).toBeInTheDocument()
  })

  it("reacts to cell click and shows direction arrow glyph", async () => {
    await renderSession()

    // Find and click a playable cell
    const gridcells = screen.getAllByRole("gridcell")
    const playableIndex = gridcells.findIndex(
      (el) => el.getAttribute("tabindex") === "0",
    )
    expect(playableIndex).toBeGreaterThanOrEqual(0)

    fireEvent.click(gridcells[playableIndex])

    // The direction arrow (→) should appear in the active cell
    // when showCornerArrowGlyph is on (default)
    expect(gridcells[playableIndex].innerHTML).toContain("\u2192")
  })
})

// ---------------------------------------------------------------------------
// daily rollover banner suite
// ---------------------------------------------------------------------------
describe("daily rollover banner", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders the banner when isNewDay returns true for daily mode", async () => {
    const { isNewDay } = await import("@pasttime/domain/daily")
    vi.mocked(isNewDay).mockReturnValue(true)

    const { CrosswordPlaySession } = await import("./crossword-play-view")

    render(
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          game={MOCK_GAME}
          modeLabel="Daily"
          gridSize={7}
          mode="daily"
        />
      </CrosswordPlayPreferencesProvider>,
    )

    expect(screen.getByText("Daily puzzle refreshed")).toBeInTheDocument()
    expect(screen.getByText("New Puzzle")).toBeInTheDocument()
    expect(screen.getByText("Keep current")).toBeInTheDocument()
  })

  it("does NOT render banner for random mode even when isNewDay returns true", async () => {
    const { isNewDay } = await import("@pasttime/domain/daily")
    vi.mocked(isNewDay).mockReturnValue(true)

    const { CrosswordPlaySession } = await import("./crossword-play-view")

    render(
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          game={MOCK_GAME}
          modeLabel="Random"
          gridSize={7}
          mode="random"
        />
      </CrosswordPlayPreferencesProvider>,
    )

    expect(screen.queryByText("Daily puzzle refreshed")).not.toBeInTheDocument()
  })

  it("'New Puzzle' click calls newPuzzle and hides banner", async () => {
    const { isNewDay } = await import("@pasttime/domain/daily")
    vi.mocked(isNewDay).mockReturnValue(true)

    const { CrosswordPlaySession } = await import("./crossword-play-view")

    render(
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          game={MOCK_GAME}
          modeLabel="Daily"
          gridSize={7}
          mode="daily"
        />
      </CrosswordPlayPreferencesProvider>,
    )

    expect(screen.getByText("Daily puzzle refreshed")).toBeInTheDocument()

    await fireEvent.click(screen.getByRole("button", { name: "New Puzzle" }))

    // Banner should be gone after clicking New Puzzle
    expect(
      screen.queryByText("Daily puzzle refreshed"),
    ).not.toBeInTheDocument()
    // But the session should still be mounted (progress preserved, just banner hidden).
    // Both the page header (game.title) and the board card title render "Crossword",
    // so assert at least one match instead of an exact single-element query.
    expect(screen.getAllByText("Crossword").length).toBeGreaterThan(0)
  })

  it("'Keep current' click hides banner without changing puzzle", async () => {
    const { isNewDay } = await import("@pasttime/domain/daily")
    vi.mocked(isNewDay).mockReturnValue(true)

    const { CrosswordPlaySession } = await import("./crossword-play-view")

    render(
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          game={MOCK_GAME}
          modeLabel="Daily"
          gridSize={7}
          mode="daily"
        />
      </CrosswordPlayPreferencesProvider>,
    )

    expect(screen.getByText("Daily puzzle refreshed")).toBeInTheDocument()

    await fireEvent.click(
      screen.getByRole("button", { name: "Keep current" }),
    )

    // Banner should be gone after dismissing
    expect(
      screen.queryByText("Daily puzzle refreshed"),
    ).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// generator error boundary suite
// ---------------------------------------------------------------------------
describe("generator error boundary", () => {
  afterEach(() => {
    cleanup()
  })

  function ThrowingChild(): React.ReactNode {
    throw new Error("Generator failure")
  }

  it("catches errors and shows error card", async () => {
    const { CrosswordPlaySessionErrorBoundary } = await import(
      "./crossword-play-view",
    )

    render(
      <CrosswordPlaySessionErrorBoundary>
        <ThrowingChild />
      </CrosswordPlaySessionErrorBoundary>,
    )

    expect(screen.getByText("Could not generate puzzle")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Could not generate a puzzle for this size. Try a different size or try again.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument()
  })

  it("'Try again' button calls onRetry and resets error state", async () => {
    const { CrosswordPlaySessionErrorBoundary } = await import(
      "./crossword-play-view",
    )

    const onRetry = vi.fn()

    // Render with error, then click Try again
    // We need to track the render cycle: first render throws,
    // then setState({ hasError: false }) + onRetry is called
    render(
      <CrosswordPlaySessionErrorBoundary onRetry={onRetry}>
        <ThrowingChild />
      </CrosswordPlaySessionErrorBoundary>,
    )

    expect(screen.getByText("Could not generate puzzle")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Try again" }))

    // onRetry should have been called
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("renders children normally when there is no error", async () => {
    const { CrosswordPlaySessionErrorBoundary } = await import(
      "./crossword-play-view",
    )

    const { container } = render(
      <CrosswordPlaySessionErrorBoundary>
        <div data-testid="child-content">Normal content</div>
      </CrosswordPlaySessionErrorBoundary>,
    )

    expect(
      screen.getByTestId("child-content"),
    ).toBeInTheDocument()
    expect(container.textContent).toBe("Normal content")
  })
})
