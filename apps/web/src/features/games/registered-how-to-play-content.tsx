"use client"

import type { GameDefinition } from "@pasttime/domain/games"
import { GameHowToPlayPlaceholder } from "@/features/games/components/game-how-to-play-placeholder"
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
    default:
      return <GameHowToPlayPlaceholder game={game} />
  }
}
