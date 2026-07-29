import { buildCrosswordShareGridLines } from "@pasttime/domain/games/crossword"
import type { CrosswordPuzzle } from "@pasttime/domain/games/crossword"

interface CrosswordShareVisualProps {
  puzzle: CrosswordPuzzle
  inputs: Readonly<Record<string, string>>
}

/**
 * Compact emoji grid for the post-solve modal — shape only, no letters.
 */
export function CrosswordShareVisual({
  puzzle,
  inputs,
}: CrosswordShareVisualProps) {
  const lines = buildCrosswordShareGridLines(puzzle, inputs)
  if (lines.length === 0) return null

  return (
    <div
      className="flex max-w-full justify-center overflow-x-auto"
      aria-label="Crossword completion pattern"
    >
      <div className="inline-flex min-w-min flex-col items-center gap-px text-[0.25rem] leading-none sm:text-[0.3125rem]">
        {lines.map((line, index) => (
          <p key={index} className="whitespace-nowrap text-center">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
