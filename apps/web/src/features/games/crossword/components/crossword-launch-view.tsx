import type { GameDefinition } from "@pasttime/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { CrosswordModePicker } from "@/features/games/crossword/components/crossword-mode-picker"
import { CrosswordSettingsWidget } from "@/features/games/crossword/components/crossword-settings-widget"

interface CrosswordLaunchViewProps {
  game: GameDefinition
}

export function CrosswordLaunchView({ game }: CrosswordLaunchViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <CrosswordSettingsWidget className="mt-6" />
      <CrosswordModePicker game={game} />
    </GamePageShell>
  )
}