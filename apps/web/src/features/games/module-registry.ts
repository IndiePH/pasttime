import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  GAME_HOW_TO_PLAY_CONTENT,
  type GameHowToPlayContentProps,
} from "@/features/games/game-how-to-play-registry"
import {
  GAME_SETTINGS_WIDGETS,
  type GameSettingsWidgetProps,
} from "@/features/games/game-settings-registry"
import type { GamePlayLayout } from "@/features/games/components/game-play-shell"
import { GameStatsView } from "@/features/games/components/game-stats-view"
import { solitaireSearchParamsCache } from "@/features/games/solitaire/search-params"
import { wordGuessSearchParamsCache } from "@/features/games/word-guess/search-params"
import { crosswordSearchParamsCache } from "@/features/games/crossword/search-params"

type SearchParamsInput = Promise<
  Record<string, string | string[] | undefined>
>

type GameLaunchViewProps = {
  game: GameDefinition
}

type GamePlayViewProps = {
  game: GameDefinition
  modeLabel: string
}

type GameStatsViewProps = {
  game: GameDefinition
}

export type GameModule = {
  LaunchView?: ComponentType<GameLaunchViewProps>
  PlayView?: ComponentType<GamePlayViewProps>
  SettingsWidget?: ComponentType<GameSettingsWidgetProps>
  HowToPlayContent?: ComponentType<GameHowToPlayContentProps>
  StatsView?: ComponentType<GameStatsViewProps>
  /** Expansive play layout for board-style games (cards, grids, etc.). */
  playLayout?: GamePlayLayout
  parseSearchParams?: (searchParams: SearchParamsInput) => Promise<void>
}

const SolitaireLaunchView = dynamic(() =>
  import("@/features/games/solitaire/components/solitaire-launch-view").then(
    (m) => ({ default: m.SolitaireLaunchView }),
  ),
)

const SolitairePlayView = dynamic(() =>
  import("@/features/games/solitaire/components/solitaire-play-view").then(
    (m) => ({ default: m.SolitairePlayView }),
  ),
)

const WordGuessLaunchView = dynamic(() =>
  import("@/features/games/word-guess/components/word-guess-launch-view").then(
    (m) => ({ default: m.WordGuessLaunchView }),
  ),
)

const WordGuessPlayView = dynamic(() =>
  import("@/features/games/word-guess/components/word-guess-play-view").then(
    (m) => ({ default: m.WordGuessPlayView }),
  ),
)

const CrosswordLaunchView = dynamic(() =>
  import("@/features/games/crossword/components/crossword-launch-view").then(
    (m) => ({ default: m.CrosswordLaunchView }),
  ),
)

const CrosswordPlayView = dynamic(() =>
  import("@/features/games/crossword/components/crossword-play-view").then(
    (m) => ({ default: m.CrosswordPlayView }),
  ),
)

export const GAME_MODULES: Partial<Record<string, GameModule>> = {
  solitaire: {
    LaunchView: SolitaireLaunchView,
    PlayView: SolitairePlayView,
    StatsView: GameStatsView,
    SettingsWidget: GAME_SETTINGS_WIDGETS.solitaire,
    playLayout: "board",
    parseSearchParams: async (searchParams) => {
      await solitaireSearchParamsCache.parse(searchParams)
    },
  },
  "word-guess": {
    LaunchView: WordGuessLaunchView,
    PlayView: WordGuessPlayView,
    StatsView: GameStatsView,
    SettingsWidget: GAME_SETTINGS_WIDGETS["word-guess"],
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT["word-guess"],
    parseSearchParams: async (searchParams) => {
      await wordGuessSearchParamsCache.parse(searchParams)
    },
  },
  crossword: {
    LaunchView: CrosswordLaunchView,
    PlayView: CrosswordPlayView,
    StatsView: GameStatsView,
    SettingsWidget: GAME_SETTINGS_WIDGETS.crossword,
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT.crossword,
    playLayout: "board",
    parseSearchParams: async (searchParams) => {
      await crosswordSearchParamsCache.parse(searchParams)
    },
  },
}

export function getGameModule(gameId: string): GameModule | undefined {
  return GAME_MODULES[gameId]
}
