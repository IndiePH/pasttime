"use client"

import type { GameDefinition } from "@pasttime/domain/games"
import { typeShieldPlayPath } from "@pasttime/domain/games/type-shield"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameOverviewSection } from "@/features/games/content/game-overview-section"
import { TypeShieldPlaySettingsWidget } from "@/features/games/type-shield/components/type-shield-play-settings-widget"
import { TypeShieldPlayPreferencesProvider } from "@/features/games/type-shield/hooks/use-type-shield-play-preferences"

interface TypeShieldLaunchViewProps {
  game: GameDefinition
}

export function TypeShieldLaunchView({ game }: TypeShieldLaunchViewProps) {
  return (
    <>
      <TypeShieldPlayPreferencesProvider>
        <GamePageShell game={game}>
          <GameSessionHeader game={game} subtitle={game.description} />
          <TypeShieldPlaySettingsWidget className="mt-6" />
          <GameLaunchActions
            game={game}
            playHref={typeShieldPlayPath()}
            statsHref="/games/type-shield/stats"
          />
        </GamePageShell>
      </TypeShieldPlayPreferencesProvider>
      <GameOverviewSection gameId={game.id} gameTitle={game.title} />
    </>
  )
}
