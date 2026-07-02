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
}

export function WordGuessBoard({
  rows,
  className,
  shakeRowIndex = null,
  shakeTrigger = 0,
  flipRowIndex = null,
  flipTrigger = 0,
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
            {row.letters.map((letter, columnIndex) => (
              <div key={`${row.id}-${columnIndex}`} role="gridcell">
                <WordGuessTile
                  letter={letter}
                  state={row.states[columnIndex]}
                  flip={shouldFlip}
                  flipIndex={columnIndex}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export type { WordGuessBoardRow }
