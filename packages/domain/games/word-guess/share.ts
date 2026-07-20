import type { WordGuessGuessEvaluation } from "./types"

const EMOJI_BY_STATE = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
} as const

export interface WordGuessShareOptions {
  guesses: readonly WordGuessGuessEvaluation[]
  maxTries: number
  /** UTC calendar date for the daily puzzle label */
  puzzleDate?: Date
  siteLabel?: string
  /** Optional link appended as the final line */
  shareUrl?: string
}

function formatUtcDateLabel(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function guessRowsToEmoji(guesses: readonly WordGuessGuessEvaluation[]): string[] {
  return guesses.map((guess) =>
    guess.letters.map((letter) => EMOJI_BY_STATE[letter.state]).join(""),
  )
}

/**
 * Wordle-style share text: header, score line, colored emoji rows only — no
 * letters or answer spoilers.
 */
export function buildWordGuessShareText({
  guesses,
  maxTries,
  puzzleDate = new Date(),
  siteLabel = "Pasttime Word Guess",
  shareUrl,
}: WordGuessShareOptions): string {
  const lines = [
    `${siteLabel} · Daily · ${formatUtcDateLabel(puzzleDate)}`,
    `${guesses.length}/${maxTries}`,
    "",
    ...guessRowsToEmoji(guesses),
  ]

  if (shareUrl) {
    lines.push("", shareUrl)
  }

  return lines.join("\n")
}
