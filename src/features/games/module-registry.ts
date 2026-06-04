import type { ComponentType } from "react"

import type { GameDefinition } from "@/domain/games"
import {
  SolitaireLaunchView,
  SolitairePlayView,
  SolitaireSettingsWidget,
} from "@/features/games/solitaire/components"
import {
  WordGuessHowToPlay,
  WordGuessLaunchView,
  WordGuessPlayView,
  WordGuessSettingsWidget,
} from "@/features/games/word-guess/components"

type GameLaunchViewProps = {
  game: GameDefinition
}

type GamePlayViewProps = {
  game: GameDefinition
  modeLabel: string
}

type GameSettingsWidgetProps = {
  className?: string
}

type GameHowToPlayContentProps = {
  game: GameDefinition
}

export type GameModule = {
  LaunchView?: ComponentType<GameLaunchViewProps>
  PlayView?: ComponentType<GamePlayViewProps>
  SettingsWidget?: ComponentType<GameSettingsWidgetProps>
  HowToPlayContent?: ComponentType<GameHowToPlayContentProps>
}

export const GAME_MODULES: Partial<Record<string, GameModule>> = {
  solitaire: {
    LaunchView: SolitaireLaunchView,
    PlayView: SolitairePlayView,
    SettingsWidget: SolitaireSettingsWidget,
  },
  "word-guess": {
    LaunchView: WordGuessLaunchView,
    PlayView: WordGuessPlayView,
    SettingsWidget: WordGuessSettingsWidget,
    HowToPlayContent: WordGuessHowToPlay,
  },
}

export function getGameModule(gameId: string): GameModule | undefined {
  return GAME_MODULES[gameId]
}
