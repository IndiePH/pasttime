import { getCellKey } from "./types"
import type { CrosswordPuzzle } from "./types"

export interface CrosswordShareOptions {
  puzzle: CrosswordPuzzle
  inputs: Readonly<Record<string, string>>
  puzzleDate?: Date
  siteLabel?: string
  shareUrl?: string
}

function formatUtcDateLabel(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Mini grid lines for share cards: blocks plus filled/empty playable cells —
 * never answer letters.
 */
export function buildCrosswordShareGridLines(
  puzzle: CrosswordPuzzle,
  inputs: Readonly<Record<string, string>>,
): string[] {
  return puzzle.grid.map((row) =>
    row
      .map((cell) => {
        if (cell.type === "block") {
          return "⬛"
        }
        const filled = Boolean(inputs[getCellKey(cell.row, cell.col)])
        return filled ? "🟩" : "⬜"
      })
      .join(""),
  )
}

export function buildCrosswordShareText({
  puzzle,
  inputs,
  puzzleDate = new Date(),
  siteLabel = "Pasttime Crossword",
  shareUrl,
}: CrosswordShareOptions): string {
  const lines = [
    siteLabel,
    `Daily · ${formatUtcDateLabel(puzzleDate)}`,
    "",
    ...buildCrosswordShareGridLines(puzzle, inputs),
  ]

  if (shareUrl) {
    lines.push("", shareUrl)
  }

  return lines.join("\n")
}
