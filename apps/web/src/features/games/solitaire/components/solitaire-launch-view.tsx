"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { parseSolitaireMode, solitairePlayPath } from "@pasttime/domain/games/solitaire"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitaireLaunchViewProps {
  game: GameDefinition
}

export function SolitaireLaunchView({ game }: SolitaireLaunchViewProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <SolitaireSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={solitairePlayPath(mode)}
        playLabel="Play"
        statsHref="/games/solitaire/stats"
      />
    </GamePageShell>
  )
}
