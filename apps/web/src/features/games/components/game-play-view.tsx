import { PlatformLink } from "@/platform/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import { gameLaunchPath } from "@pasttime/domain/games"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"

interface GamePlayViewProps {
  game: GameDefinition
  modeLabel: string
}

export function GamePlayView({ game, modeLabel }: GamePlayViewProps) {
  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={modeLabel} />
      <Card className="mt-8 w-full text-left">
        <CardHeader>
          <CardTitle>Game board</CardTitle>
          <CardDescription>
            The {game.title} module will load here. This placeholder confirms
            the launch flow is wired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-10 text-sm text-muted-foreground">
            Waiting for game module…
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-8" asChild>
        <PlatformLink href={gameLaunchPath(game.id)}>
          Back to launch options
        </PlatformLink>
      </Button>
    </GamePageShell>
  )
}
