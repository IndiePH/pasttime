import type { ComponentType } from "react"

import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"

export type GameSettingsWidgetProps = {
  className?: string
}

export const GAME_SETTINGS_WIDGETS: Partial<
  Record<string, ComponentType<GameSettingsWidgetProps>>
> = {
  solitaire: SolitaireSettingsWidget,
  "word-guess": WordGuessSettingsWidget,
}

export { RegisteredGameSettings } from "@/features/games/registered-game-settings"
