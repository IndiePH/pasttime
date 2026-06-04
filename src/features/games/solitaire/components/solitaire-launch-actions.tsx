"use client"

import Link from "next/link"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@/domain/games"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { parseSolitaireMode, solitairePlayPath } from "@/domain/games/solitaire"
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
          <Link href={solitairePlayPath(mode)}>Play</Link>
        </Button>
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <Link href="/">Back to catalog</Link>
      </Button>
    </>
  )
}
