"use client"

import { buttonVariants } from "@/components/ui/button"
import type { GameDefinition } from "@pasttime/domain/games"
import { RegisteredHowToPlayContent } from "@/features/games/game-how-to-play-registry"
import { cn } from "@/lib/utils"

interface GameHowToPlayProps {
  game: GameDefinition
  className?: string
}

/**
 * Uniform “How To Play” entry on launch pages. The rules stay in this one
 * control and are in the initial HTML, so the closed disclosure is still
 * readable by crawlers. Games register copy via the how-to-play registry.
 */
export function GameHowToPlay({ game, className }: GameHowToPlayProps) {
  if (game.status === "coming_soon") {
    return null
  }

  return (
    <details className={cn("flex w-full flex-col items-center text-left", className)}>
      <summary
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-60 cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden",
        )}
      >
        How To Play
      </summary>
      <div className="mx-auto mt-4 w-full max-w-lg rounded-lg border border-border bg-card p-4 text-card-foreground">
        <h2 className="text-base font-semibold tracking-tight">
          How To Play · {game.title}
        </h2>
        <div className="mt-3">
          <RegisteredHowToPlayContent game={game} />
        </div>
      </div>
    </details>
  )
}
