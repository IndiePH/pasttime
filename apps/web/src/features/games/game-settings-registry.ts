import type { ComponentType } from "react"

import { CrosswordSettingsWidget } from "@/features/games/crossword/components/crossword-settings-widget"
import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"
import { SudokuSettingsWidget } from "@/features/games/sudoku/components/sudoku-settings-widget"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"

export type GameSettingsWidgetProps = {
  className?: string
}

export const GAME_SETTINGS_WIDGETS: Partial<
   Record<string, ComponentType<GameSettingsWidgetProps>>
 > = {
   solitaire: SolitaireSettingsWidget,
   "word-guess": WordGuessSettingsWidget,
   crossword: CrosswordSettingsWidget,
   sudoku: SudokuSettingsWidget,
 }

export { RegisteredGameSettings } from "@/features/games/registered-game-settings"
