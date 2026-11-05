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
import { sudokuSearchParamsCache } from "@/features/games/sudoku/search-params"
import { typeRushSearchParamsCache } from "@/features/games/type-rush/search-params"

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>

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
    (m) => ({ default: m.SolitaireLaunchView })
  )
)

const SolitairePlayView = dynamic(() =>
  import("@/features/games/solitaire/components/solitaire-play-view").then(
    (m) => ({ default: m.SolitairePlayView })
  )
)

const WordGuessLaunchView = dynamic(() =>
  import("@/features/games/word-guess/components/word-guess-launch-view").then(
    (m) => ({ default: m.WordGuessLaunchView })
  )
)

const WordGuessPlayView = dynamic(() =>
  import("@/features/games/word-guess/components/word-guess-play-view").then(
    (m) => ({ default: m.WordGuessPlayView })
  )
)

const CrosswordLaunchView = dynamic(() =>
  import("@/features/games/crossword/components/crossword-launch-view").then(
    (m) => ({ default: m.CrosswordLaunchView })
  )
)

const CrosswordPlayView = dynamic(() =>
  import("@/features/games/crossword/components/crossword-play-view").then(
    (m) => ({ default: m.CrosswordPlayView })
  )
)

const SudokuLaunchView = dynamic(() =>
  import("@/features/games/sudoku/components/sudoku-launch-view").then((m) => ({
    default: m.SudokuLaunchView,
  }))
)

const SudokuPlayView = dynamic(() =>
  import("@/features/games/sudoku/components/sudoku-play-view").then((m) => ({
    default: m.SudokuPlayView,
  }))
)

const TypeRushLaunchView = dynamic(() =>
  import("@/features/games/type-rush/components/type-rush-launch-view").then(
    (m) => ({ default: m.TypeRushLaunchView })
  )
)

const TypeRushPlayView = dynamic(() =>
  import("@/features/games/type-rush/components/type-rush-play-view").then(
    (m) => ({ default: m.TypeRushPlayView })
  )
)

const TypeShieldLaunchView = dynamic(() =>
  import("@/features/games/type-shield/components/type-shield-launch-view").then(
    (m) => ({ default: m.TypeShieldLaunchView })
  )
)

const TypeShieldPlayView = dynamic(() =>
  import("@/features/games/type-shield/components/type-shield-play-view").then(
    (m) => ({ default: m.TypeShieldPlayView })
  )
)

const ReversiLaunchView = dynamic(() =>
  import("@/features/games/reversi/components/reversi-launch-view").then(
    (m) => ({ default: m.ReversiLaunchView })
  )
)

const ReversiPlayView = dynamic(() =>
  import("@/features/games/reversi/components/reversi-play-view").then((m) => ({
    default: m.ReversiPlayView,
  }))
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
  sudoku: {
    LaunchView: SudokuLaunchView,
    PlayView: SudokuPlayView,
    StatsView: GameStatsView,
    SettingsWidget: GAME_SETTINGS_WIDGETS.sudoku,
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT.sudoku,
    playLayout: "board",
    parseSearchParams: async (searchParams) => {
      await sudokuSearchParamsCache.parse(searchParams)
    },
  },
  "type-rush": {
    LaunchView: TypeRushLaunchView,
    PlayView: TypeRushPlayView,
    StatsView: GameStatsView,
    SettingsWidget: GAME_SETTINGS_WIDGETS["type-rush"],
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT["type-rush"],
    parseSearchParams: async (searchParams) => {
      await typeRushSearchParamsCache.parse(searchParams)
    },
  },
  "type-shield": {
    LaunchView: TypeShieldLaunchView,
    PlayView: TypeShieldPlayView,
    StatsView: GameStatsView,
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT["type-shield"],
  },
  reversi: {
    LaunchView: ReversiLaunchView,
    PlayView: ReversiPlayView,
    HowToPlayContent: GAME_HOW_TO_PLAY_CONTENT.reversi,
    SettingsWidget: GAME_SETTINGS_WIDGETS.reversi,
    playLayout: "board",
  },
}

export function getGameModule(gameId: string): GameModule | undefined {
  return GAME_MODULES[gameId]
}
