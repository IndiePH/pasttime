import type { GameIconId } from "./types"

/** Saturated header backgrounds for hub game tiles (darker in light mode). */
export const GAME_CARD_HEADER_CLASS: Record<GameIconId, string> = {
  "sample-word": "bg-[#584710] dark:bg-[#6b5618]",
  "sample-grid": "bg-[#382948] dark:bg-[#453560]",
  "sample-quiz": "bg-[#1b4049] dark:bg-[#234f58]",
  "sample-tiles": "bg-[#33461b] dark:bg-[#3d5420]",
  "sample-crew": "bg-[#66322c] dark:bg-[#7a3d36]",
}

export function getGameCardHeaderClass(icon: GameIconId): string {
  return GAME_CARD_HEADER_CLASS[icon]
}
