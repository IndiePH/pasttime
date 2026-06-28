import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CrosswordClue } from "@pasttime/domain/games/crossword"
import {
  createCrosswordGameState,
  type CrosswordGameState,
} from "@pasttime/domain/games/crossword"
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

function makeGameState(): CrosswordGameState {
  return createCrosswordGameState(7, "random")
}

const MOCK_GAME = {
  id: "crossword",
  slug: "crossword",
  name: "Crossword",
  description: "Test game",
  icon: "crossword",
} as const

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
          game={MOCK_GAME as any}
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
