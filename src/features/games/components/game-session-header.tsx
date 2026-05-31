import { GameIcon } from "@/components/ui/icons"
import type { GameDefinition } from "@/domain/games"

interface GameSessionHeaderProps {
  game: GameDefinition
  subtitle?: string
}

export function GameSessionHeader({ game, subtitle }: GameSessionHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center">
      <GameIcon
        id={game.icon}
        className="size-20 rounded-2xl"
        title={game.title}
      />
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {game.title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  )
}
