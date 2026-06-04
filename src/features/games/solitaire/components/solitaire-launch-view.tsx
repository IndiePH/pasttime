import { AdPanel } from "@/components/shared/ad-panel"
import type { GameDefinition } from "@/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameLaunchSettings } from "@/features/games/components/game-launch-settings"
import { SolitaireLaunchActions } from "@/features/games/solitaire/components/solitaire-launch-actions"

interface SolitaireLaunchViewProps {
  game: GameDefinition
}

export function SolitaireLaunchView({ game }: SolitaireLaunchViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <GameLaunchSettings game={game} className="mt-6" />
      <SolitaireLaunchActions game={game} />
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
