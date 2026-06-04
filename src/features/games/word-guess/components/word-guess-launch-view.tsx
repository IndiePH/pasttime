import { AdPanel } from "@/components/shared/ad-panel"
import type { GameDefinition } from "@/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { WordGuessLaunchActions } from "@/features/games/word-guess/components/word-guess-launch-actions"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"

interface WordGuessLaunchViewProps {
  game: GameDefinition
}

export function WordGuessLaunchView({ game }: WordGuessLaunchViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <WordGuessSettingsWidget className="mt-6" />
      <WordGuessLaunchActions game={game} />
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
