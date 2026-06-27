"use client"

import { GameSettingsPlaceholder } from "@/features/games/components/game-settings-placeholder"
import { CrosswordSettingsWidget } from "@/features/games/crossword/components/crossword-settings-widget"
import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"

interface RegisteredGameSettingsProps {
  gameId: string
  className?: string
}

/** Renders per-game settings without dynamic component lookup (eslint + cycle safe). */
export function RegisteredGameSettings({
  gameId,
  className,
}: RegisteredGameSettingsProps) {
  switch (gameId) {
    case "solitaire":
      return <SolitaireSettingsWidget className={className} />
    case "word-guess":
      return <WordGuessSettingsWidget className={className} />
    case "crossword":
      return <CrosswordSettingsWidget className={className} />
    default:
      return <GameSettingsPlaceholder gameId={gameId} className={className} />
  }
}
