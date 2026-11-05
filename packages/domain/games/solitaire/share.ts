export interface KlondikeShareOptions {
  drawCount: 1 | 3
  moves: number
  /** Already formatted clock, `m:ss` or `h:mm:ss`. */
  elapsedLabel?: string
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

/** Lines only. No tableau, ranks, or suits. */
export function buildKlondikeShareText({
  drawCount,
  moves,
  elapsedLabel,
  puzzleDate = new Date(),
  siteLabel = "Pasttime Solitaire",
  shareUrl,
}: KlondikeShareOptions): string {
  const lines = [
    siteLabel,
    `Daily · ${formatUtcDateLabel(puzzleDate)}`,
    "",
    drawCount === 3 ? "Draw 3" : "Draw 1",
    `${moves} moves`,
  ]

  if (elapsedLabel) {
    lines.push(elapsedLabel)
  }

  if (shareUrl) {
    lines.push("", shareUrl)
  }

  return lines.join("\n")
}
