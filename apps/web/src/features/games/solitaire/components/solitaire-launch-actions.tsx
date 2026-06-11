"use client"

import { PlatformLink } from "@/platform/navigation"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@pasttime/domain/games"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { parseSolitaireMode, solitairePlayPath } from "@pasttime/domain/games/solitaire"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitaireLaunchActionsProps {
  game: GameDefinition
}

export function SolitaireLaunchActions({ game }: SolitaireLaunchActionsProps) {
  const [modeParam] = useQueryState("mode", solitaireSearchParams.mode)
  const mode = parseSolitaireMode(modeParam)

  return (
    <>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <GameHowToPlay game={game} />
        <Button type="button" className="w-full" asChild>
          <PlatformLink href={solitairePlayPath(mode)}>Play</PlatformLink>
        </Button>
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <PlatformLink href="/">Back to catalog</PlatformLink>
      </Button>
    </>
  )
}
