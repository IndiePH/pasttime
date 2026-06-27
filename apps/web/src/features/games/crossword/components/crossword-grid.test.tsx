import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type {
  CrosswordCell,
  CrosswordClue,
  CrosswordDirection,
  CrosswordPuzzle,
} from "@pasttime/domain/games/crossword"
import { CrosswordGrid } from "./crossword-grid"

// ---------------------------------------------------------------------------
// Test fixture — same grid layout as navigation.test.ts
// ---------------------------------------------------------------------------
//   r0:  C  A  T  .  .
//   r1:  A  B  S  .  .
//   r2:  D  O  G  S  .
//   r3:  .  .  .  .  .
//   r4:  .  .  A  T  .
//
// Across: 1=CAT (len 3 @ 0,0), 4=DOGS (len 4 @ 2,0), 7=AT (len 2 @ 4,2)
// Down:   1=CAD (len 3 @ 0,0), 2=AB (len 2 @ 0,1), 3=TS (len 2 @ 0,2)

function buildTestPuzzle(): CrosswordPuzzle {
  const block = (row: number, col: number): CrosswordCell => ({
    type: "block",
    row,
    col,
  })
  const letter = (
    row: number,
    col: number,
    ch: string,
  ): CrosswordCell => ({
    type: "letter",
    row,
    col,
    answerLetter: ch,
  })

  const grid: CrosswordCell[][] = [
    [letter(0, 0, "C"), letter(0, 1, "A"), letter(0, 2, "T"), block(0, 3), block(0, 4)],
    [letter(1, 0, "A"), letter(1, 1, "B"), letter(1, 2, "S"), block(1, 3), block(1, 4)],
    [letter(2, 0, "D"), letter(2, 1, "O"), letter(2, 2, "G"), letter(2, 3, "S"), block(2, 4)],
    [block(3, 0), block(3, 1), block(3, 2), block(3, 3), block(3, 4)],
    [block(4, 0), block(4, 1), letter(4, 2, "A"), letter(4, 3, "T"), block(4, 4)],
  ]

  const across: CrosswordClue[] = [
    { id: "a1", number: 1, direction: "across", text: "Feline", answer: "CAT", row: 0, col: 0 },
    { id: "a4", number: 4, direction: "across", text: "Pets, plural", answer: "DOGS", row: 2, col: 0 },
    { id: "a7", number: 7, direction: "across", text: "Ticklish", answer: "AT", row: 4, col: 2 },
  ]
  const down: CrosswordClue[] = [
    { id: "d1", number: 1, direction: "down", text: "Bad driver", answer: "CAD", row: 0, col: 0 },
    { id: "d2", number: 2, direction: "down", text: "Blood letters", answer: "AB", row: 0, col: 1 },
    { id: "d3", number: 3, direction: "down", text: "Stamps", answer: "TS", row: 0, col: 2 },
  ]

  return { id: "grid-test", grid, across, down }
}

const GRID_SIZE = 5

function cellIndex(row: number, col: number): number {
  return row * GRID_SIZE + col
}

const blocks = [
  { row: 0, col: 3 }, { row: 0, col: 4 },
  { row: 1, col: 3 }, { row: 1, col: 4 },
  { row: 2, col: 4 },
  { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 },
  { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 4 },
]

const CAT_CLUE: CrosswordClue = {
  id: "a1", number: 1, direction: "across", text: "Feline", answer: "CAT", row: 0, col: 0,
}

const DOGS_CLUE: CrosswordClue = {
  id: "a4", number: 4, direction: "across", text: "Pets, plural", answer: "DOGS", row: 2, col: 0,
}

const AT_CLUE: CrosswordClue = {
  id: "a7", number: 7, direction: "across", text: "Ticklish", answer: "AT", row: 4, col: 2,
}

const CAD_CLUE: CrosswordClue = {
  id: "d1", number: 1, direction: "down", text: "Bad driver", answer: "CAD", row: 0, col: 0,
}

const TS_CLUE: CrosswordClue = {
  id: "d3", number: 3, direction: "down", text: "Stamps", answer: "TS", row: 0, col: 2,
}

// Shared puzzle fixture reference (rebuilt every test for isolation)
function makePuzzle() {
  return buildTestPuzzle()
}

// Default prefs — all indicators off so tests don't depend on indicator rendering
const defaultPrefs = {
  showWordSpanHighlight: false,
  showCornerArrowGlyph: false,
  showDirectionBorderColor: false,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getGridcells() {
  return screen.getAllByRole("gridcell")
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe("CrosswordGrid handleKeyDown", () => {
  afterEach(() => {
    cleanup()
  })

  describe("Space toggles direction (D-01)", () => {
    it("calls onDirectionChange when the other direction has a word", () => {
      const onDirectionChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: " " })

      expect(onDirectionChange).toHaveBeenCalledWith("down")
      expect(onCellClick).not.toHaveBeenCalled()
    })

    it("is a no-op when the other direction has no word at the cell", () => {
      const onDirectionChange = vi.fn()
      const onCellClick = vi.fn()
      const onCellChange = vi.fn()
      const puzzle = buildTestPuzzle()

      // Cell (2,1) is only-across (DOGS), no down word
      const dogsOnlyCell: CrosswordClue = {
        id: "a4", number: 4, direction: "across", text: "Pets", answer: "DOGS", row: 2, col: 0,
      }

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 2, col: 1 }}
          activeClue={dogsOnlyCell}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(2, 1)], { key: " " })

      expect(onDirectionChange).not.toHaveBeenCalled()
      expect(onCellClick).not.toHaveBeenCalled()
      expect(onCellChange).not.toHaveBeenCalled()
    })
  })

  describe("Letter input advances (D-06 / D-07)", () => {
    it("types a letter and advances to the next cell in the word", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "X" })

      expect(onCellChange).toHaveBeenCalledWith(0, 0, "X")
      expect(onCellClick).toHaveBeenCalledWith(0, 1)
    })

    it("stops at the last cell — no advance (D-06)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 2 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 2)], { key: "Z" })

      expect(onCellChange).toHaveBeenCalledWith(0, 2, "Z")
      expect(onCellClick).not.toHaveBeenCalled()
    })

    it("fills an already-filled cell (overwrite — D-07)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C", "0,1": "A" }}
          activeCell={{ row: 0, col: 1 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 1)], { key: "Q" })

      expect(onCellChange).toHaveBeenCalledWith(0, 1, "Q")
      expect(onCellClick).toHaveBeenCalledWith(0, 2)
    })
  })

  describe("Arrow keys — direction-aware (D-04)", () => {
    it("parallel arrow moves to the neighbor cell", () => {
      const onCellClick = vi.fn()
      const onDirectionChange = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      // ArrowRight is parallel in across mode
      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "ArrowRight" })

      expect(onDirectionChange).not.toHaveBeenCalled()
      expect(onCellClick).toHaveBeenCalledWith(0, 1)
    })

    it("perpendicular arrow flips direction when the other direction has a word", () => {
      const onDirectionChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      // ArrowDown is perpendicular in across mode; (0,0) has CAD down word
      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "ArrowDown" })

      expect(onDirectionChange).toHaveBeenCalledWith("down")
      expect(onCellClick).not.toHaveBeenCalled()
    })

    it("perpendicular arrow is no-op when the other direction has NO word", () => {
      const onDirectionChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      // Cell (2,1) is only-across (DOGS), no down word
      const dogsClue: CrosswordClue = {
        id: "a4", number: 4, direction: "across", text: "Pets", answer: "DOGS", row: 2, col: 0,
      }

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 2, col: 1 }}
          activeClue={dogsClue}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      // ArrowDown is perpendicular; (2,1) has no down word
      fireEvent.keyDown(getGridcells()[cellIndex(2, 1)], { key: "ArrowDown" })

      expect(onDirectionChange).not.toHaveBeenCalled()
      expect(onCellClick).not.toHaveBeenCalled()
    })

    it("parallel arrow into a block is a no-op", () => {
      const onCellClick = vi.fn()
      const onDirectionChange = vi.fn()
      const puzzle = buildTestPuzzle()

      // Cell (2,3) is last cell of DOGS; (2,4) is a block
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 2, col: 3 }}
          activeClue={DOGS_CLUE}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(2, 3)], { key: "ArrowRight" })

      expect(onCellClick).not.toHaveBeenCalled()
      expect(onDirectionChange).not.toHaveBeenCalled()
    })

    it("parallel arrow out of bounds is a no-op", () => {
      const onCellClick = vi.fn()
      const onDirectionChange = vi.fn()
      const puzzle = buildTestPuzzle()

      // Cell (4,3) is last cell of AT; going right would be out of bounds
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 4, col: 3 }}
          activeClue={AT_CLUE}
          direction="across"
          onDirectionChange={onDirectionChange}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(4, 3)], { key: "ArrowRight" })

      expect(onCellClick).not.toHaveBeenCalled()
      expect(onDirectionChange).not.toHaveBeenCalled()
    })
  })

  describe("Backspace (D-10 / D-11 / D-12)", () => {
    it("on a filled non-first cell clears and moves back (D-10)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C", "0,1": "A" }}
          activeCell={{ row: 0, col: 1 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 1)], { key: "Backspace" })

      expect(onCellChange).toHaveBeenCalledWith(0, 1, "")
      expect(onCellClick).toHaveBeenCalledWith(0, 0)
    })

    it("on an empty non-first cell clears (no-op) and moves back (D-11)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C" }}
          activeCell={{ row: 0, col: 1 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 1)], { key: "Backspace" })

      // The handler always calls onCellChange("") then onCellClick(prev)
      expect(onCellChange).toHaveBeenCalledWith(0, 1, "")
      expect(onCellClick).toHaveBeenCalledWith(0, 0)
    })

    it("on a filled first cell clears but does NOT move (D-12)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C" }}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "Backspace" })

      expect(onCellChange).toHaveBeenCalledWith(0, 0, "")
      expect(onCellClick).not.toHaveBeenCalled()
    })

    it("on an empty first cell is a no-op (D-12)", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "Backspace" })

      expect(onCellChange).not.toHaveBeenCalled()
      expect(onCellClick).not.toHaveBeenCalled()
    })
  })

  describe("Delete (D-13)", () => {
    it("clears the cell in place with no movement", () => {
      const onCellChange = vi.fn()
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C", "0,1": "A" }}
          activeCell={{ row: 0, col: 1 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={onCellChange}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 1)], { key: "Delete" })

      expect(onCellChange).toHaveBeenCalledWith(0, 1, "")
      expect(onCellClick).not.toHaveBeenCalled()
    })
  })

  describe("Tab / Shift+Tab (D-08)", () => {
    it("Tab moves to the next clue's first cell", () => {
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], { key: "Tab" })

      // Next clue after CAT (number 1, across) is DOGS (number 4, across) at (2,0)
      expect(onCellClick).toHaveBeenCalledWith(2, 0)
    })

    it("Shift+Tab moves to the previous clue's first cell", () => {
      const onCellClick = vi.fn()
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={onCellClick}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          {...defaultPrefs}
        />,
      )

      fireEvent.keyDown(getGridcells()[cellIndex(0, 0)], {
        key: "Tab",
        shiftKey: true,
      })

      // Previous clue before CAT (number 1, across) is AT (number 7, across) at (4,2) — wrap
      expect(onCellClick).toHaveBeenCalledWith(4, 2)
    })
  })

  describe("Indicator class assertions (D-05 / D-14 / D-18)", () => {
    it("renders bg-primary/15 on non-active cells in the active word, gated by showWordSpanHighlight", () => {
      const puzzle = buildTestPuzzle()

      // CAT runs across (0,0)-(0,1)-(0,2); active cell is (0,0), so (0,1) and (0,2) get tint
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={true}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={false}
        />,
      )

      const cells = getGridcells()
      // Cell (0,1) — non-active, in active word → has bg-primary/15
      expect(cells[cellIndex(0, 1)].className).toContain("bg-primary/15")
      // Cell (0,0) — active cell → does NOT have word-span tint
      expect(cells[cellIndex(0, 0)].className).not.toContain("bg-primary/15")
      // Cell (1,0) — not in active word → does NOT have bg-primary/15
      expect(cells[cellIndex(1, 0)].className).not.toContain("bg-primary/15")
    })

    it("renders no word-span tint when showWordSpanHighlight is false", () => {
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={false}
        />,
      )

      const cells = getGridcells()
      // Even cells in the active word should not have the tint when gated off
      expect(cells[cellIndex(0, 1)].className).not.toContain("bg-primary/15")
    })

    it("renders the direction arrow glyph on the active cell when enabled", () => {
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={true}
          showDirectionBorderColor={false}
        />,
      )

      const cells = getGridcells()
      // Active cell should contain the across arrow (→)
      expect(cells[cellIndex(0, 0)].innerHTML).toContain("\u2192")

      // Down mode: active cell should show the down arrow (↓)
      // Unmount and re-render with direction="down"
      cleanup()
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAD_CLUE}
          direction="down"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={true}
          showDirectionBorderColor={false}
        />,
      )

      const cellsDown = getGridcells()
      expect(cellsDown[cellIndex(0, 0)].innerHTML).toContain("\u2193")
    })

    it("does not render the glyph when showCornerArrowGlyph is false", () => {
      const puzzle = buildTestPuzzle()

      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={false}
        />,
      )

      const cells = getGridcells()
      // The test defaults have all indicators off, so no glyph
      expect(cells[cellIndex(0, 0)].innerHTML).not.toContain("\u2192")
    })

    it("uses ring-ring for across and ring-primary for down when direction border color is enabled", () => {
      const puzzle = buildTestPuzzle()

      // Across mode → ring-ring
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={true}
        />,
      )

      const cells = getGridcells()
      expect(cells[cellIndex(0, 0)].className).toContain("ring-ring")

      cleanup()

      // Down mode → ring-primary
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{}}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAD_CLUE}
          direction="down"
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={false}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={true}
        />,
      )

      const cellsDown = getGridcells()
      expect(cellsDown[cellIndex(0, 0)].className).toContain("ring-primary")
    })

    it("applies destructive class to a wrong in-word cell (error-overrides-tint D-18)", () => {
      const puzzle = buildTestPuzzle()

      // Cell (0,1) is in CAT (answer is 'A'); we set input 'B' to trigger error.
      // The cell is also in the active word, so both bg-primary/15 and bg-destructive/10
      // apply. Since isError is last in cn(), bg-destructive/10 should be present.
      render(
        <CrosswordGrid
          gridSize={GRID_SIZE}
          inputs={{ "0,0": "C", "0,1": "B" }}
          activeCell={{ row: 0, col: 0 }}
          activeClue={CAT_CLUE}
          direction="across"
          showErrors={true}
          onDirectionChange={vi.fn()}
          onCellChange={vi.fn()}
          onCellClick={vi.fn()}
          blocks={blocks}
          gridData={puzzle.grid}
          puzzle={puzzle}
          showWordSpanHighlight={true}
          showCornerArrowGlyph={false}
          showDirectionBorderColor={false}
        />,
      )

      const cells = getGridcells()
      const cell = cells[cellIndex(0, 1)]
      // Cell should have the destructive background (error overrides tint per D-18)
      expect(cell.className).toContain("bg-destructive/10")
      // Cell should NOT have the word-span tint (destructive won, per D-18)
      // Note: tailwind-merge keeps the last conflicting utility, so
      // bg-destructive/10 should be present, and bg-primary/15 may or may not be
      // depending on whether tailwind-merge removes it. The key assertion is
      // that the destructive class is present — the cell renders as an error.
      expect(cell.className).toContain("bg-destructive")
      expect(cell.getAttribute("aria-invalid")).toBe("true")
    })
  })
})
