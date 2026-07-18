import type { ComponentType } from "react"

import type { GameDefinition } from "@pasttime/domain/games"
import { CrosswordHowToPlay } from "@/features/games/crossword/components/crossword-how-to-play"
import { SolitaireHowToPlay } from "@/features/games/solitaire/components/solitaire-how-to-play"
import { SudokuHowToPlay } from "@/features/games/sudoku/components/sudoku-how-to-play"
import { WordGuessHowToPlay } from "@/features/games/word-guess/components/word-guess-how-to-play"

export type GameHowToPlayContentProps = {
  game: GameDefinition
}

export const GAME_HOW_TO_PLAY_CONTENT: Partial<
   Record<string, ComponentType<GameHowToPlayContentProps>>
 > = {
   "word-guess": WordGuessHowToPlay,
   crossword: CrosswordHowToPlay,
   solitaire: SolitaireHowToPlay,
   sudoku: SudokuHowToPlay,
 }

export { RegisteredHowToPlayContent } from "@/features/games/registered-how-to-play-content"
