import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  WordGuessBoard,
  type WordGuessBoardRow,
} from "@/features/games/word-guess/components/word-guess-board"

const rows: WordGuessBoardRow[] = [
  {
    id: "row-0",
    letters: ["C", "R", "A", "N", "E"],
    states: ["correct", "present", "absent", "absent", "absent"],
  },
  {
    id: "row-1",
    letters: ["A", "P", "", "", ""],
    states: ["filled", "filled", "empty", "empty", "empty"],
  },
]

describe("WordGuessBoard cell selection", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  })

  it("lets the player select a cell in the current row only", () => {
    const onSelectColumn = vi.fn()
    render(
      <WordGuessBoard
        rows={rows}
        activeRowIndex={1}
        selectedColumn={1}
        onSelectColumn={onSelectColumn}
      />,
    )

    fireEvent.click(screen.getByRole("gridcell", { name: "C, correct position" }))
    expect(onSelectColumn).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("gridcell", { name: "A, pending guess" }))
    expect(onSelectColumn).toHaveBeenCalledWith(0)

    const emptyCells = screen.getAllByRole("gridcell", { name: "Empty tile" })
    fireEvent.click(emptyCells[0])
    expect(onSelectColumn).toHaveBeenCalledWith(2)

    expect(
      screen.getByRole("gridcell", { name: "P, pending guess, selected" }),
    ).toHaveAttribute("aria-selected", "true")
  })
})
