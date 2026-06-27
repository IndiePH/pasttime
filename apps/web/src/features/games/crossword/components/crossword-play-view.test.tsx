import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { CrosswordClue } from "@pasttime/domain/games/crossword"
import { CrosswordClues } from "./crossword-play-view"

const ACROSS_CLUES: CrosswordClue[] = [
  { id: "a1", number: 1, direction: "across", text: "Feline", answer: "CAT", row: 0, col: 0 },
  { id: "a4", number: 4, direction: "across", text: "Pets, plural", answer: "DOGS", row: 2, col: 0 },
]

const DOWN_CLUES: CrosswordClue[] = [
  { id: "d1", number: 1, direction: "down", text: "Bad driver", answer: "CAD", row: 0, col: 0 },
  { id: "d3", number: 3, direction: "down", text: "Stamps", answer: "TS", row: 0, col: 2 },
]

describe("CrosswordClues", () => {
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

    expect(screen.getByText(/1\./)).toBeInTheDocument()
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

    // The 1. Feline clue should be highlighted
    const acrossItems = screen.getAllByRole("listitem")
    // Find the one containing "Feline"
    const activeLi = acrossItems.find((el) => el.textContent?.includes("Feline"))
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
    // The DOGS clue (non-active) should NOT be highlighted
    const nonActiveLi = acrossItems.find((el) => el.textContent?.includes("Pets"))
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
    const activeLi = acrossItems.find((el) => el.textContent?.includes("Feline"))
    expect(activeLi).toBeDefined()
    expect(scrollIntoViewMock).toHaveBeenCalled()
  })

  it("adds bg-primary/20 blink class when blinkActiveClue is on and motion is not reduced", () => {
    vi.useFakeTimers()

    // Ensure prefers-reduced-motion is false (default in jsdom)
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
    const activeLi = acrossItems.find((el) => el.textContent?.includes("Feline"))
    expect(activeLi).toBeDefined()

    // The blink class should be present immediately (added in useEffect)
    expect(activeLi!.className).toContain("bg-primary/20")

    // After 260ms, the blink class should be removed
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
    const activeLi = acrossItems.find((el) => el.textContent?.includes("Feline"))
    expect(activeLi).toBeDefined()

    // The blink class should NOT be present when blinkActiveClue is off
    expect(activeLi!.className).not.toContain("bg-primary/20")

    vi.useRealTimers()
  })
})
