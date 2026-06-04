import type { GameDefinition } from "@/domain/games"
import { GameSettingsPlaceholder } from "@/features/games/components/game-settings-placeholder"
import { getGameModule } from "@/features/games/module-registry"

interface GameLaunchSettingsProps {
  game: GameDefinition
  className?: string
}

/**
 * Per-game settings slot on the launch page. Games with custom settings
 * register here; others use the shared placeholder until implemented.
 */
export function GameLaunchSettings({ game, className }: GameLaunchSettingsProps) {
  if (game.status === "coming_soon") {
    return null
  }

  const gameModule = getGameModule(game.id)
  if (gameModule?.SettingsWidget) {
    const SettingsWidget = gameModule.SettingsWidget
    return <SettingsWidget className={className} />
  }

  return <GameSettingsPlaceholder gameId={game.id} className={className} />
}
