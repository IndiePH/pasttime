"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { GameDefinition } from "@/domain/games"
import { GameHowToPlayPlaceholder } from "@/features/games/components/game-how-to-play-placeholder"
import { getGameModule } from "@/features/games/module-registry"
import { cn } from "@/lib/utils"

interface GameHowToPlayProps {
  game: GameDefinition
  className?: string
}

/**
 * Uniform “How to play” entry on launch pages. Games register copy via the
 * module registry; others see a shared placeholder until implemented.
 */
export function GameHowToPlay({ game, className }: GameHowToPlayProps) {
  if (game.status === "coming_soon") {
    return null
  }

  const gameModule = getGameModule(game.id)
  const HowToPlayContent =
    gameModule?.HowToPlayContent ?? GameHowToPlayPlaceholder

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full", className)}
        >
          How to play
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(85vh,32rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How to play · {game.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Rules and tips for {game.title}
          </DialogDescription>
        </DialogHeader>
        <HowToPlayContent game={game} />
      </DialogContent>
    </Dialog>
  )
}
