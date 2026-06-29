"use client"

import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import type { GameDefinition } from "@pasttime/domain/games"
import { crosswordPlayPath } from "@pasttime/domain/games/crossword"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"
import { PlatformLink } from "@/platform/navigation"

const AVAILABLE_SIZES = [7, 9, 11, 13, 15] as const

interface CrosswordModePickerProps {
  game: GameDefinition
}

export function CrosswordModePicker({ game }: CrosswordModePickerProps) {
  const [size, setSize] = useQueryState("size", crosswordSearchParams.size)
  const [mode, setMode] = useQueryState("mode", crosswordSearchParams.mode)

  const resolvedSize = size ?? 7
  const resolvedMode = mode ?? "daily"

  return (
    <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
      {/* Mode toggle pills */}
      <div className="flex gap-2">
        <Button
          variant={resolvedMode === "daily" ? "default" : "outline"}
          aria-pressed={resolvedMode === "daily"}
          onClick={() => void setMode("daily")}
          className="flex-1"
        >
          Daily Puzzle
        </Button>
        <Button
          variant={resolvedMode === "random" ? "default" : "outline"}
          aria-pressed={resolvedMode === "random"}
          onClick={() => void setMode("random")}
          className="flex-1"
        >
          Endless Mode
        </Button>
      </div>

      {/* Grid size chips — always visible per UI-SPEC */}
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Grid size</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((s) => {
            const isActive = resolvedSize === s
            return (
              <Button
                key={s}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                aria-pressed={isActive}
                onClick={() => void setSize(s)}
              >
                {s}x{s}
              </Button>
            )
          })}
        </div>
      </div>

      <GameHowToPlay game={game} />

      <Button className="w-full" asChild>
        <PlatformLink href={crosswordPlayPath(resolvedSize, resolvedMode)}>
          Play Crossword
        </PlatformLink>
      </Button>

      <Button variant="outline" className="w-full" asChild>
        <PlatformLink href="/">Back to catalog</PlatformLink>
      </Button>
    </div>
  )
}
