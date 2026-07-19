import type { GameIconId } from "./types"

/** Saturated header backgrounds for hub game tiles (brighter in light mode). */
export const GAME_CARD_HEADER_CLASS: Record<GameIconId, string> = {
  "word-guess": "bg-[#8c6d14] dark:bg-[#6b5618]",
  solitaire: "bg-[#2e7a4e] dark:bg-[#25603f]",
  tongits: "bg-[#7a4f32] dark:bg-[#5a3c29]",
  "pusoy-dos": "bg-[#6e4f46] dark:bg-[#503b35]",
  crossword: "bg-[#2b6675] dark:bg-[#234f58]",
  sudoku: "bg-[#40518c] dark:bg-[#34406a]",
  reversi: "bg-[#4f6d29] dark:bg-[#3d5420]",
  "fleet-grid": "bg-[#446182] dark:bg-[#385069]",
  spades: "bg-[#753c67] dark:bg-[#5b2f4f]",
  "word-factory": "bg-[#786222] dark:bg-[#5e4d1c]",
  "type-rush": "bg-[#5c4499] dark:bg-[#493676]",
  "type-shield": "bg-[#94493f] dark:bg-[#7a3d36]",
  "tile-words": "bg-[#2f735d] dark:bg-[#265a49]",
}

export function getGameCardHeaderClass(icon: GameIconId): string {
  return GAME_CARD_HEADER_CLASS[icon]
}
