"use client"

import type { GameDefinition } from "@pasttime/domain/games"
import { GameHowToPlayPlaceholder } from "@/features/games/components/game-how-to-play-placeholder"
import { CrosswordHowToPlay } from "@/features/games/crossword/components/crossword-how-to-play"
import { SolitaireHowToPlay } from "@/features/games/solitaire/components/solitaire-how-to-play"
import { SudokuHowToPlay } from "@/features/games/sudoku/components/sudoku-how-to-play"
import { WordGuessHowToPlay } from "@/features/games/word-guess/components/word-guess-how-to-play"

interface RegisteredHowToPlayContentProps {
  game: GameDefinition
}

/** Renders per-game rules without dynamic component lookup (eslint + cycle safe). */
export function RegisteredHowToPlayContent({
  game,
}: RegisteredHowToPlayContentProps) {
  switch (game.id) {
    case "word-guess":
      return <WordGuessHowToPlay game={game} />
    case "crossword":
      return <CrosswordHowToPlay game={game} />
    case "solitaire":
      return <SolitaireHowToPlay game={game} />
    case "sudoku":
      return <SudokuHowToPlay game={game} />
    default:
      return <GameHowToPlayPlaceholder game={game} />
  }
}
