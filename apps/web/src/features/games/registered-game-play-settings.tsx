"use client"

import { GameSettingsPlaceholder } from "@/features/games/components/game-settings-placeholder"
import { SolitairePlaySettingsWidget } from "@/features/games/solitaire/components/solitaire-play-settings-widget"
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
    default:
      return <GameSettingsPlaceholder gameId={gameId} className={className} />
  }
}
