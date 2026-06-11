import type { GameDefinition } from "@pasttime/domain/games"
import { RegisteredGamePlaySettings } from "@/features/games/game-play-settings-registry"

interface GamePlaySettingsProps {
  game: GameDefinition
  className?: string
}

/**
 * Per-game settings inside the play area. Launch settings stay on the setup
 * screen; play settings cover session tweaks such as card skins and toggles.
 */
export function GamePlaySettings({ game, className }: GamePlaySettingsProps) {
  if (game.status === "coming_soon") {
    return null
  }

  return <RegisteredGamePlaySettings gameId={game.id} className={className} />
}
