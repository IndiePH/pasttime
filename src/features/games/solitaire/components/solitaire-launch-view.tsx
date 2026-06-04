import { AdPanel } from "@/components/shared/ad-panel"
import type { GameDefinition } from "@/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { SolitaireLaunchActions } from "@/features/games/solitaire/components/solitaire-launch-actions"
import { SolitaireSettingsWidget } from "@/features/games/solitaire/components/solitaire-settings-widget"

interface SolitaireLaunchViewProps {
  game: GameDefinition
}

export function SolitaireLaunchView({ game }: SolitaireLaunchViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <SolitaireSettingsWidget className="mt-6" />
      <SolitaireLaunchActions game={game} />
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
