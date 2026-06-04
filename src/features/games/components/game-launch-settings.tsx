import type { GameDefinition } from "@/domain/games"
import { RegisteredGameSettings } from "@/features/games/game-settings-registry"

interface GameLaunchSettingsProps {
  game: GameDefinition
  className?: string
}

/**
 * Per-game settings slot on the launch page. Games with custom settings
 * register in game-settings-registry; others see the shared placeholder.
 */
export function GameLaunchSettings({ game, className }: GameLaunchSettingsProps) {
  if (game.status === "coming_soon") {
    return null
  }

  return <RegisteredGameSettings gameId={game.id} className={className} />
}
