import type { GameDefinition } from "@pasttime/domain/games"

interface GameHowToPlayPlaceholderProps {
  game: GameDefinition
}

export function GameHowToPlayPlaceholder({
  game,
}: GameHowToPlayPlaceholderProps) {
  return (
    <p className="text-sm text-muted-foreground">
      Rules for {game.title} are on the way. Check back soon.
    </p>
  )
}
