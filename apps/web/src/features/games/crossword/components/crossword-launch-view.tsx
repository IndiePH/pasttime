import type { GameDefinition } from "@pasttime/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { CrosswordModePicker } from "@/features/games/crossword/components/crossword-mode-picker"

interface CrosswordLaunchViewProps {
  game: GameDefinition
}

export function CrosswordLaunchView({ game }: CrosswordLaunchViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <CrosswordModePicker game={game} />
    </GamePageShell>
  )
}
