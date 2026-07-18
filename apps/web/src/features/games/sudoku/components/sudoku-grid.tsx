"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"
import {
  findConflictIndexes,
  indexToRowCol,
  rowColToIndex,
  type SudokuCell,
  type SudokuDigit,
} from "@pasttime/domain/games/sudoku"

interface SudokuGridProps {
  cells: SudokuCell[]
  selectedIndex: number | null
  /** Locks selection + input, e.g. after a win. */
  disabled?: boolean
  onSelect: (index: number) => void
  onPlaceDigit: (digit: SudokuDigit) => void
  onClear: () => void
  onToggleCandidateMode: () => void
}

const DIGIT_KEYS: Record<string, SudokuDigit> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
}

const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
}

const ALL_DIGITS: SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function SudokuCandidates({ candidates }: { candidates: SudokuDigit[] }) {
  const marked = new Set(candidates)
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-px leading-none text-muted-foreground">
      {ALL_DIGITS.map((digit) => (
        <span
          key={digit}
          className="flex items-center justify-center text-[0.5rem] sm:text-[0.6rem]"
        >
          {marked.has(digit) ? digit : ""}
        </span>
      ))}
    </div>
  )
}

export function SudokuGrid({
  cells,
  selectedIndex,
  disabled = false,
  onSelect,
  onPlaceDigit,
  onClear,
  onToggleCandidateMode,
}: SudokuGridProps) {
  const conflicts = useMemo(() => findConflictIndexes(cells), [cells])

  const selectedDigit =
    selectedIndex !== null && cells[selectedIndex] && cells[selectedIndex].value !== 0
      ? cells[selectedIndex].value
      : null

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (disabled) return

    const digit = DIGIT_KEYS[event.key]
    if (digit) {
      event.preventDefault()
      onPlaceDigit(digit)
      return
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      onClear()
      return
    }

    if (event.key === " ") {
      event.preventDefault()
      onToggleCandidateMode()
      return
    }

    const delta = ARROW_DELTAS[event.key]
    if (delta) {
      event.preventDefault()
      const { row, col } = indexToRowCol(index)
      const nextRow = row + delta[0]
      const nextCol = col + delta[1]
      if (nextRow >= 0 && nextRow < 9 && nextCol >= 0 && nextCol < 9) {
        onSelect(rowColToIndex(nextRow, nextCol))
      }
    }
  }

  return (
    <div className="inline-block rounded-sm border-2 border-foreground/70 dark:border-white/70">
      <div
        className="sudoku-grid grid grid-cols-9 grid-rows-9"
        role="grid"
        aria-label="Sudoku grid"
      >
        {cells.map((cell, index) => {
          const { row, col } = indexToRowCol(index)
          const isSelected = selectedIndex === index
          const isConflict = cell.value !== 0 && conflicts.has(index)
          const isSameDigit =
            !isSelected && selectedDigit !== null && cell.value === selectedDigit

          return (
            <div
              key={index}
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                "sudoku-cell relative flex items-center justify-center border border-border/60 text-base font-semibold transition-colors duration-150 sm:text-lg",
                "bg-game-card-surface dark:bg-game-card-surface/90",
                !disabled && "cursor-pointer",
                disabled && "cursor-not-allowed",
                // Thick 3×3 box borders (outer edges handled by the container border).
                col % 3 === 0 && col !== 0 && "border-l-2 border-l-foreground/50 dark:border-l-white/50",
                row % 3 === 0 && row !== 0 && "border-t-2 border-t-foreground/50 dark:border-t-white/50",
                cell.given ? "text-foreground" : "text-primary",
                isSameDigit && "bg-primary/10",
                isSelected && "bg-primary/20 ring-2 ring-ring",
                isConflict && "bg-destructive/10 text-destructive dark:text-destructive",
                !disabled && !isSelected && "hover:bg-muted/60 dark:hover:bg-muted/30",
              )}
              onClick={() => {
                if (!disabled) onSelect(index)
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {cell.value !== 0 ? (
                <span>{cell.value}</span>
              ) : cell.candidates.length > 0 ? (
                <SudokuCandidates candidates={cell.candidates} />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
