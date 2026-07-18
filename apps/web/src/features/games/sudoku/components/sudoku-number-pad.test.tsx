import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SudokuNumberPad } from "./sudoku-number-pad"

afterEach(() => {
  cleanup()
})

describe("SudokuNumberPad", () => {
  it("renders digit buttons 1–9 and calls onDigit when clicked", () => {
    const onDigit = vi.fn()
    render(
      <SudokuNumberPad
        candidateMode={false}
        canUndo={false}
        onDigit={onDigit}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
        onUndo={vi.fn()}
      />,
    )

    for (let d = 1; d <= 9; d++) {
      expect(screen.getByRole("button", { name: String(d) })).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole("button", { name: "7" }))
    expect(onDigit).toHaveBeenCalledWith(7)
  })

  it("calls onClear when Clear is clicked", () => {
    const onClear = vi.fn()
    render(
      <SudokuNumberPad
        candidateMode={false}
        canUndo={false}
        onDigit={vi.fn()}
        onClear={onClear}
        onToggleCandidateMode={vi.fn()}
        onUndo={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /clear/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("labels the mode toggle Normal/Candidates and reflects aria-pressed", () => {
    const onToggleCandidateMode = vi.fn()
    const { rerender } = render(
      <SudokuNumberPad
        candidateMode={false}
        canUndo={false}
        onDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={onToggleCandidateMode}
        onUndo={vi.fn()}
      />,
    )
    const toggle = screen.getByRole("button", { name: "Normal" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    fireEvent.click(toggle)
    expect(onToggleCandidateMode).toHaveBeenCalledTimes(1)

    rerender(
      <SudokuNumberPad
        candidateMode
        canUndo={false}
        onDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={onToggleCandidateMode}
        onUndo={vi.fn()}
      />,
    )
    const toggled = screen.getByRole("button", { name: "Candidates" })
    expect(toggled).toHaveAttribute("aria-pressed", "true")
  })

  it("disables Undo when canUndo is false and enables + wires it when true", () => {
    const onUndo = vi.fn()
    const { rerender } = render(
      <SudokuNumberPad
        candidateMode={false}
        canUndo={false}
        onDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
        onUndo={onUndo}
      />,
    )
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled()

    rerender(
      <SudokuNumberPad
        candidateMode={false}
        canUndo
        onDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
        onUndo={onUndo}
      />,
    )
    const undoButton = screen.getByRole("button", { name: /undo/i })
    expect(undoButton).toBeEnabled()
    fireEvent.click(undoButton)
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it("disables all controls when disabled is true", () => {
    render(
      <SudokuNumberPad
        disabled
        candidateMode={false}
        canUndo
        onDigit={vi.fn()}
        onClear={vi.fn()}
        onToggleCandidateMode={vi.fn()}
        onUndo={vi.fn()}
      />,
    )
    expect(screen.getByRole("button", { name: "1" })).toBeDisabled()
    expect(screen.getByRole("button", { name: /clear/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Normal" })).toBeDisabled()
    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled()
  })
})
