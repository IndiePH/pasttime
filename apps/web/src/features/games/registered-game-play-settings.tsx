"use client"

import { GameSettingsPlaceholder } from "@/features/games/components/game-settings-placeholder"
import { CrosswordPlaySettingsWidget } from "@/features/games/crossword/components/crossword-play-settings-widget"
import { SolitairePlaySettingsWidget } from "@/features/games/solitaire/components/solitaire-play-settings-widget"
import { SudokuPlaySettingsWidget } from "@/features/games/sudoku/components/sudoku-play-settings-widget"
import { WordGuessPlaySettingsWidget } from "@/features/games/word-guess/components/word-guess-play-settings-widget"

interface RegisteredGamePlaySettingsProps {
  gameId: string
  className?: string
}

/** Renders per-game play settings without dynamic component lookup. */
export function RegisteredGamePlaySettings({
  gameId,
  className,
}: RegisteredGamePlaySettingsProps) {
  switch (gameId) {
    case "solitaire":
      return <SolitairePlaySettingsWidget className={className} />
    case "word-guess":
      return <WordGuessPlaySettingsWidget className={className} />
    case "crossword":
      return <CrosswordPlaySettingsWidget className={className} />
    case "sudoku":
      return <SudokuPlaySettingsWidget className={className} />
    default:
      return <GameSettingsPlaceholder gameId={gameId} className={className} />
  }
}
