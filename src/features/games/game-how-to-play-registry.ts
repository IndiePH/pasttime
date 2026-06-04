import type { ComponentType } from "react"

import type { GameDefinition } from "@/domain/games"
import { WordGuessHowToPlay } from "@/features/games/word-guess/components/word-guess-how-to-play"

export type GameHowToPlayContentProps = {
  game: GameDefinition
}

export const GAME_HOW_TO_PLAY_CONTENT: Partial<
  Record<string, ComponentType<GameHowToPlayContentProps>>
> = {
  "word-guess": WordGuessHowToPlay,
}

export { RegisteredHowToPlayContent } from "@/features/games/registered-how-to-play-content"
