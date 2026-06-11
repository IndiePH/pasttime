import type { GameIconId } from "./types"

/** Saturated header backgrounds for hub game tiles (darker in light mode). */
export const GAME_CARD_HEADER_CLASS: Record<GameIconId, string> = {
  "word-guess": "bg-[#584710] dark:bg-[#6b5618]",
  solitaire: "bg-[#1e4d32] dark:bg-[#25603f]",
  tongits: "bg-[#4a3120] dark:bg-[#5a3c29]",
  "pusoy-dos": "bg-[#43312c] dark:bg-[#503b35]",
  crossword: "bg-[#1b4049] dark:bg-[#234f58]",
  sudoku: "bg-[#2a3558] dark:bg-[#34406a]",
  reversi: "bg-[#33461b] dark:bg-[#3d5420]",
  "fleet-grid": "bg-[#2d3f52] dark:bg-[#385069]",
  spades: "bg-[#4a2641] dark:bg-[#5b2f4f]",
  "word-factory": "bg-[#4d3f17] dark:bg-[#5e4d1c]",
  "type-rush": "bg-[#3d2d63] dark:bg-[#493676]",
  "type-shield": "bg-[#66322c] dark:bg-[#7a3d36]",
  "tile-words": "bg-[#1f4a3c] dark:bg-[#265a49]",
}

export function getGameCardHeaderClass(icon: GameIconId): string {
  return GAME_CARD_HEADER_CLASS[icon]
}
