"use client"

import { PlatformLink } from "@/platform/navigation"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import type { GameDefinition } from "@pasttime/domain/games"
import { crosswordPlayPath } from "@pasttime/domain/games/crossword"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"

interface CrosswordModePickerProps {
  game: GameDefinition
}

export function CrosswordModePicker({ game }: CrosswordModePickerProps) {
  const [sizeParam] = useQueryState("size", crosswordSearchParams.size)
  const [modeParam] = useQueryState("mode", crosswordSearchParams.mode)

  const size = (sizeParam ?? 15) as 5 | 7 | 9 | 11 | 13 | 15
  const mode = (modeParam ?? "daily") as "daily" | "random"

  return (
    <>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <GameHowToPlay game={game} />
        <Button type="button" className="w-full" asChild>
          <PlatformLink href={crosswordPlayPath(size, mode)}>Play</PlatformLink>
        </Button>
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <PlatformLink href="/">Back to catalog</PlatformLink>
      </Button>
    </>
  )
}