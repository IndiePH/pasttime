import { cn } from "@/lib/utils"
import {
  type WordGuessBoardTileState,
  WordGuessTile,
} from "@/features/games/word-guess/components/word-guess-tile"

interface WordGuessBoardRow {
  id: string
  letters: string[]
  states: WordGuessBoardTileState[]
}

interface WordGuessBoardProps {
  rows: WordGuessBoardRow[]
  className?: string
  shakeRowIndex?: number | null
  shakeTrigger?: number
  flipRowIndex?: number | null
  flipTrigger?: number
  /** Row that accepts letter edits. Null when the round is over. */
  activeRowIndex?: number | null
  selectedColumn?: number | null
  onSelectColumn?: (columnIndex: number) => void
}

export function WordGuessBoard({
  rows,
  className,
  shakeRowIndex = null,
  shakeTrigger = 0,
  flipRowIndex = null,
  flipTrigger = 0,
  activeRowIndex = null,
  selectedColumn = null,
  onSelectColumn,
}: WordGuessBoardProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-1.5", className)}
      role="grid"
      aria-label={`Word Guess board with ${rows.length} rows`}
    >
      {rows.map((row, rowIndex) => {
        const shouldShake = rowIndex === shakeRowIndex && shakeTrigger > 0
        const shouldFlip = rowIndex === flipRowIndex && flipTrigger > 0

        return (
          <div
            key={shouldShake ? `${row.id}-${shakeTrigger}` : row.id}
            className={cn("flex gap-1.5", shouldShake && "word-guess-row-shake")}
            role="row"
            aria-rowindex={rowIndex + 1}
          >
            {row.letters.map((letter, columnIndex) => {
              const isActiveCell = rowIndex === activeRowIndex && Boolean(onSelectColumn)
              const isSelected = isActiveCell && columnIndex === selectedColumn
              const tile = (
                <WordGuessTile
                  letter={letter}
                  state={row.states[columnIndex]}
                  flip={shouldFlip}
                  flipIndex={columnIndex}
                  selected={isSelected}
                />
              )

              if (!isActiveCell || !onSelectColumn) {
                return (
                  <div key={`${row.id}-${columnIndex}`} role="gridcell">
                    {tile}
                  </div>
                )
              }

              return (
                <button
                  key={`${row.id}-${columnIndex}`}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  className="cursor-pointer appearance-none rounded-sm border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onSelectColumn(columnIndex)}
                >
                  {tile}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export type { WordGuessBoardRow }
