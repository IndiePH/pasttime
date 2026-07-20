import type { WordGuessGuessEvaluation } from "@pasttime/domain/games/word-guess"
import { WordGuessTile } from "@/features/games/word-guess/components/word-guess-tile"

interface WordGuessShareVisualProps {
  guesses: readonly WordGuessGuessEvaluation[]
}

/**
 * Spoiler-free colored tile rows for the post-solve modal (no letters).
 */
export function WordGuessShareVisual({ guesses }: WordGuessShareVisualProps) {
  if (guesses.length === 0) return null

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      aria-label="Guess pattern summary"
    >
      {guesses.map((guess, rowIndex) => (
        <div key={rowIndex} className="flex gap-0.5">
          {guess.letters.map((letter, columnIndex) => (
            <WordGuessTile
              key={columnIndex}
              letter=""
              state={letter.state}
              size="compact"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
