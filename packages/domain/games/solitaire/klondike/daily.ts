import { getDailySeed, hashSeed } from "../../../daily"

import type { SolitaireRoundMode } from "../round"

export type KlondikeLayoutId = "klondike-draw1" | "klondike-draw3"

export function klondikeLayoutId(drawCount: 1 | 3): KlondikeLayoutId {
  return drawCount === 3 ? "klondike-draw3" : "klondike-draw1"
}

/**
 * Same UTC date and draw count always yield the same seed.
 * Draw 1 and Draw 3 are offset so they are not the same layout.
 */
export function klondikeDailySeed(date: Date, drawCount: 1 | 3): number {
  return hashSeed(getDailySeed(date) + drawCount * 97)
}

/** Matches `useDailyCompleted("solitaire", layout)` for daily rounds. */
export function getKlondikeStorageKey(
  layout: KlondikeLayoutId,
  round: SolitaireRoundMode,
  date = new Date(),
): string {
  if (round === "daily") {
    return `solitaire:daily:${layout}:${getDailySeed(date)}`
  }
  return `solitaire:random:${layout}`
}
