import type { ComponentType } from "react"

import type { GameDefinition } from "@/domain/games"
import {
  GAME_HOW_TO_PLAY_CONTENT,
  type GameHowToPlayContentProps,
} from "@/features/games/game-how-to-play-registry"
import {
  GAME_SETTINGS_WIDGETS,
  type GameSettingsWidgetProps,
} from "@/features/games/game-settings-registry"
import { SolitaireLaunchView } from "@/features/games/solitaire/components/solitaire-launch-view"
import { SolitairePlayView } from "@/features/games/solitaire/components/solitaire-play-view"
import { WordGuessLaunchView } from "@/features/games/word-guess/components/word-guess-launch-view"
import { WordGuessPlayView } from "@/features/games/word-guess/components/word-guess-play-view"

type GameLaunchViewProps = {
  game: GameDefinition
}

type GamePlayViewProps = {
  game: GameDefinition
  modeLabel: string
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
    SettingsWidget: GAME_SETTINGS_WIDGETS.solitaire,
  },
  "word-guess": {
    LaunchView: WordGuessLaunchView,
    PlayView: WordGuessPlayView,
    SettingsWidget: GAME_SETTINGS_WIDGETS["word-guess"],
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT["word-guess"],
  },
}

export function getGameModule(gameId: string): GameModule | undefined {
  return GAME_MODULES[gameId]
}
