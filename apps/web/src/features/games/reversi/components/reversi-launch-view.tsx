"use client"

import type { GameDefinition } from "@pasttime/domain/games"
import { gamePlayPath } from "@pasttime/domain/games"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameOverviewSection } from "@/features/games/content/game-overview-section"

import { ReversiSettingsWidget } from "./reversi-settings-widget"

interface ReversiLaunchViewProps {
  game: GameDefinition
}

export function ReversiLaunchView({ game }: ReversiLaunchViewProps) {
  return (
    <>
      <GamePageShell game={game}>
        <GameSessionHeader game={game} subtitle={game.description} />
        <ReversiSettingsWidget className="mt-6" />
        <GameLaunchActions
          game={game}
          playHref={gamePlayPath(game.id)}
          statsHref="/games/reversi/stats"
        />
      </GamePageShell>
      <GameOverviewSection gameId={game.id} gameTitle={game.title} />
    </>
  )
}
