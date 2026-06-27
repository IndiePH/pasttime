"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type {
  CrosswordCell,
  CrosswordClue,
  CrosswordDirection,
  CrosswordPuzzle,
} from "@pasttime/domain/games/crossword"
import {
  cellIndexInClue,
  findClueAtCell,
  getClueCells,
  nextCellInWord,
  nextClueInDirection,
  previousCellInWord,
  previousClueInDirection,
  resolveDirection,
} from "@pasttime/domain/games/crossword"

interface CrosswordGridProps {
  gridSize: number
  inputs: Record<string, string>
  activeCell?: { row: number; col: number }
  showErrors?: boolean
  onCellChange: (row: number, col: number, value: string) => void
  onCellClick: (row: number, col: number) => void
  blocks: Array<{ row: number; col: number }>
  gridData: CrosswordCell[][]
  direction?: CrosswordDirection
  onDirectionChange?: (d: CrosswordDirection) => void
  activeClue?: CrosswordClue | null
  showWordSpanHighlight?: boolean
  showCornerArrowGlyph?: boolean
  showDirectionBorderColor?: boolean
  puzzle?: CrosswordPuzzle
}

function cellKey(row: number, col: number): string {
  return `${row},${col}`
}

export function CrosswordGrid({
  gridSize,
  inputs,
  activeCell,
  showErrors = false,
  onCellChange,
  onCellClick,
  blocks,
  gridData,
  direction = "across",
  onDirectionChange,
  activeClue: activeClueProp,
  showWordSpanHighlight = false,
  showCornerArrowGlyph = false,
  showDirectionBorderColor = false,
  puzzle,
}: CrosswordGridProps) {
  const blockSet = new Set(blocks.map((b) => `${b.row},${b.col}`))
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Stable callback-ref setter for the cell ref map.
  const setCellRef = (el: HTMLElement | null, key: string) => {
    if (el) cellRefs.current.set(key, el)
    else cellRefs.current.delete(key)
  }

  // Focus the active cell whenever it changes (click + keyboard moves).
  useEffect(() => {
    if (activeCell) {
      cellRefs.current
        .get(cellKey(activeCell.row, activeCell.col))
        ?.focus()
    }
  }, [activeCell])

  const otherDir = (): CrosswordDirection =>
    direction === "across" ? "down" : "across"

  const hasWordInDir = (
    row: number,
    col: number,
    dir: CrosswordDirection,
  ): boolean => {
    if (!puzzle) return false
    return findClueAtCell(puzzle, { row, col }, dir) !== null
  }

  // ------------------------------------------------------------------
  //  handleKeyDown — the full NYT key matrix (per locked decisions)
  // ------------------------------------------------------------------
  const handleKeyDown = (
    e: React.KeyboardEvent,
    row: number,
    col: number,
  ) => {
    const cell = { row, col }

    // --- Letter a–z (D-06 advance, D-07 overwrite) ---
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      onCellChange(row, col, e.key.toUpperCase())
      if (activeClueProp) {
        const next = nextCellInWord(activeClueProp, cell)
        if (next) onCellClick(next.row, next.col)
        // D-06: stop at last cell — no onCellClick when next is null
      }
      return
    }

    // --- Space (D-01) ---
    if (e.key === " ") {
      e.preventDefault()
      const other = otherDir()
      if (hasWordInDir(row, col, other)) onDirectionChange?.(other)
      // No word in the other direction → no-op
      return
    }

    // --- Backspace (D-10 filled non-first, D-11 empty non-first, D-12 first) ---
    if (e.key === "Backspace") {
      if (activeClueProp) {
        const idx = cellIndexInClue(activeClueProp, cell)
        if (idx > 0) {
          // Non-first cell: clear current, move back
          onCellChange(row, col, "")
          const prev = previousCellInWord(activeClueProp, cell)
          if (prev) onCellClick(prev.row, prev.col)
        } else if (idx === 0) {
          // First cell
          const val = inputs[cellKey(row, col)]
          if (val && val.length > 0) {
            // Filled first cell: clear only (D-12)
            onCellChange(row, col, "")
          }
          // Empty first cell: hard no-op (D-12)
        } else {
          // Cell not in active clue — clear and no move
          onCellChange(row, col, "")
        }
      } else {
        onCellChange(row, col, "")
      }
      return
    }

    // --- Delete (D-13) ---
    if (e.key === "Delete") {
      onCellChange(row, col, "")
      return
    }

    // --- Arrow keys (D-04) ---
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown"
    ) {
      e.preventDefault()
      const isAcross = direction === "across"
      const isLeft = e.key === "ArrowLeft"
      const isRight = e.key === "ArrowRight"
      const isUp = e.key === "ArrowUp"
      const isDown = e.key === "ArrowDown"

      const isParallel =
        (isAcross && (isLeft || isRight)) ||
        (!isAcross && (isUp || isDown))

      if (isParallel) {
        // Move one physical cell in the arrow direction.
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
        }
        const [dr, dc] = delta[e.key]
        const nr = row + dr
        const nc = col + dc

        if (
          nr >= 0 &&
          nr < gridSize &&
          nc >= 0 &&
          nc < gridSize &&
          !blockSet.has(`${nr},${nc}`)
        ) {
          onCellClick(nr, nc)
        }
        // Block / out-of-bounds → no-op
      } else {
        // Perpendicular arrow: flip direction at the same cell.
        const other = otherDir()
        if (hasWordInDir(row, col, other)) onDirectionChange?.(other)
        // No word in the other direction → no-op
      }
      return
    }

    // --- Tab / Shift+Tab (D-08) ---
    if (e.key === "Tab") {
      e.preventDefault()
      const number = activeClueProp?.number
      if (puzzle) {
        if (e.shiftKey) {
          const prevClue = previousClueInDirection(puzzle, direction, number)
          onCellClick(prevClue.row, prevClue.col)
        } else {
          const nextClue = nextClueInDirection(puzzle, direction, number)
          onCellClick(nextClue.row, nextClue.col)
        }
      }
    }
  }

  // ------------------------------------------------------------------
  //  Render
  // ------------------------------------------------------------------

  // Derive the set of cells in the active word (for Task 2 tint).
  const activeWordCells = new Set<string>()
  if (activeClueProp && showWordSpanHighlight) {
    const cells = getClueCells(activeClueProp)
    for (const c of cells) {
      activeWordCells.add(cellKey(c.row, c.col))
    }
  }

  return (
    <div
      className="crossword-grid grid gap-px"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, var(--crossword-cell-w))`,
        gridTemplateRows: `repeat(${gridSize}, var(--crossword-cell-w))`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, i) => {
        const row = Math.floor(i / gridSize)
        const col = i % gridSize
        const key = cellKey(row, col)
        const isBlock = blockSet.has(key)
        const isActive = activeCell?.row === row && activeCell?.col === col
        const value = inputs[key] || ""
        const cellData = gridData?.[row]?.[col]
        const clueNum = cellData?.clueNumber
        const isInActiveWord = activeWordCells.has(key)

        // Error only when typed answer disagrees with grid and showErrors is on.
        // Empty cells are never errors (no answer leakage).
        const isError =
          !isBlock &&
          showErrors &&
          value.length > 0 &&
          cellData?.answerLetter !== undefined &&
          value.toUpperCase() !== cellData.answerLetter

        return (
          <div
            key={key}
            ref={(el) => setCellRef(el, key)}
            className={cn(
              "crossword-cell text-center text-lg font-semibold tracking-wide uppercase",
              "relative transition-colors duration-150",
              isBlock
                ? "cursor-not-allowed bg-muted/30"
                : "cursor-pointer border border-border bg-game-card-surface dark:bg-game-card-surface/90",
              !isBlock &&
                isActive &&
                "border-foreground ring-2 ring-ring dark:border-white",
              !isBlock &&
                !isActive &&
                "hover:border-foreground/50 dark:hover:border-white/50",
              isError &&
                "border-destructive/60 bg-destructive/10 text-destructive dark:border-destructive dark:text-destructive",
            )}
            onClick={(e) => {
              if (!isBlock) {
                ;(e.currentTarget as HTMLElement).focus()
                onCellClick(row, col)
              }
            }}
            onKeyDown={(e) => !isBlock && handleKeyDown(e, row, col)}
            tabIndex={!isBlock ? 0 : -1}
            role="gridcell"
            aria-selected={isActive}
            aria-invalid={isError || undefined}
          >
            {!isBlock && (
              <>
                {clueNum ? (
                  <span className="absolute top-0.5 left-0.5 text-[10px] leading-none font-normal">
                    {clueNum}
                  </span>
                ) : null}
                <span className="flex h-full w-full items-center justify-center">
                  {value || "\u00A0"}
                </span>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
