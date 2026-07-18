import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { SudokuCell, SudokuDigit } from "@pasttime/domain/games/sudoku"

import { SudokuGrid } from "./sudoku-grid"

/** 81 empty, non-given cells by default; overrides patch specific indexes. */
function buildCells(overrides: Record<number, Partial<SudokuCell>> = {}): SudokuCell[] {
  return Array.from({ length: 81 }, (_, i) => ({
    given: false,
    value: 0,
    candidates: [],
    ...overrides[i],
  }))
}

afterEach(() => {
  cleanup()
})

describe("SudokuGrid", () => {
  it("renders 81 gridcells", () => {
    render(
      <SudokuGrid
        cells={buildCells()}
        selectedIndex={null}
        onSelect={vi.fn()}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    expect(screen.getAllByRole("gridcell")).toHaveLength(81)
  })

  it("shows a placed digit's value", () => {
    render(
      <SudokuGrid
        cells={buildCells({ 40: { value: 7 } })}
        selectedIndex={null}
        onSelect={vi.fn()}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    expect(screen.getByText("7")).toBeInTheDocument()
  })

  it("renders candidates as a 3×3 micro-grid inside an empty cell", () => {
    render(
      <SudokuGrid
        cells={buildCells({ 0: { candidates: [1, 5, 9] as SudokuDigit[] } })}
        selectedIndex={null}
        onSelect={vi.fn()}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("9")).toBeInTheDocument()
    // 2/3/4/6/7/8 are unmarked and should not render as text nodes.
    expect(screen.queryByText("2")).not.toBeInTheDocument()
  })

  it("marks aria-selected on the selected cell and calls onSelect when a cell is clicked", () => {
    const onSelect = vi.fn()
    render(
      <SudokuGrid
        cells={buildCells()}
        selectedIndex={5}
        onSelect={onSelect}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    const cells = screen.getAllByRole("gridcell")
    expect(cells[5]).toHaveAttribute("aria-selected", "true")

    fireEvent.click(cells[10])
    expect(onSelect).toHaveBeenCalledWith(10)
  })

  it("flags peer-conflicting cells (same digit twice in a row) with aria handled via class, still renders both values", () => {
    // Row 0: indexes 0 and 1 both hold "3" — a live conflict.
    render(
      <SudokuGrid
        cells={buildCells({ 0: { value: 3 }, 1: { value: 3 } })}
        selectedIndex={null}
        onSelect={vi.fn()}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    const cells = screen.getAllByRole("gridcell")
    expect(cells[0]).toHaveClass("text-destructive")
    expect(cells[1]).toHaveClass("text-destructive")
  })

  it("dispatches digit keys, Backspace/Delete, and Space via the selected cell's keydown handler", () => {
    const onPlaceDigit = vi.fn()
    const onClear = vi.fn()
    const onToggleCandidateMode = vi.fn()
    render(
      <SudokuGrid
        cells={buildCells()}
        selectedIndex={0}
        onSelect={vi.fn()}
        onPlaceDigit={onPlaceDigit}
        onClear={onClear}
        onToggleCandidateMode={onToggleCandidateMode}
      />,
    )
    const cell = screen.getAllByRole("gridcell")[0]

    fireEvent.keyDown(cell, { key: "5" })
    expect(onPlaceDigit).toHaveBeenCalledWith(5)

    fireEvent.keyDown(cell, { key: "Backspace" })
    expect(onClear).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(cell, { key: "Delete" })
    expect(onClear).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(cell, { key: " " })
    expect(onToggleCandidateMode).toHaveBeenCalledTimes(1)
  })

  it("moves selection with arrow keys within bounds", () => {
    const onSelect = vi.fn()
    render(
      <SudokuGrid
        cells={buildCells()}
        selectedIndex={10} // row 1, col 1
        onSelect={onSelect}
        onPlaceDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    const cell = screen.getAllByRole("gridcell")[10]

    fireEvent.keyDown(cell, { key: "ArrowRight" })
    expect(onSelect).toHaveBeenCalledWith(11)

    fireEvent.keyDown(cell, { key: "ArrowDown" })
    expect(onSelect).toHaveBeenCalledWith(19)
  })

  it("ignores clicks and keyboard input while disabled (locked after a win)", () => {
    const onSelect = vi.fn()
    const onPlaceDigit = vi.fn()
    render(
      <SudokuGrid
        cells={buildCells()}
        selectedIndex={0}
        disabled
        onSelect={onSelect}
        onPlaceDigit={onPlaceDigit}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
      />,
    )
    const cells = screen.getAllByRole("gridcell")
    fireEvent.click(cells[1])
    fireEvent.keyDown(cells[0], { key: "5" })

    expect(onSelect).not.toHaveBeenCalled()
    expect(onPlaceDigit).not.toHaveBeenCalled()
    expect(cells[0]).toHaveAttribute("tabIndex", "-1")
  })
})
