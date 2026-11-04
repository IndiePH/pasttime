export interface SudokuShareOptions {
  difficultyLabel: string
  /** Already formatted clock, `m:ss` or `h:mm:ss`. */
  elapsedLabel: string
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

/** Lines only. No grid, givens, or filled digits. */
export function buildSudokuShareText({
  difficultyLabel,
  elapsedLabel,
  puzzleDate = new Date(),
  siteLabel = "Pasttime Sudoku",
  shareUrl,
}: SudokuShareOptions): string {
  const lines = [
    siteLabel,
    `Daily · ${formatUtcDateLabel(puzzleDate)}`,
    "",
    difficultyLabel,
    elapsedLabel,
  ]

  if (shareUrl) {
    lines.push("", shareUrl)
  }

  return lines.join("\n")
}
