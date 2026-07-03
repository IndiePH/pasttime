"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { crosswordPlayPath } from "@pasttime/domain/games/crossword"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { CrosswordSettingsWidget } from "@/features/games/crossword/components/crossword-settings-widget"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"
import { useDailyCompleted } from "@/features/games/hooks/use-daily-completed"

interface CrosswordLaunchViewProps {
  game: GameDefinition
}

export function CrosswordLaunchView({ game }: CrosswordLaunchViewProps) {
  const [size] = useQueryState("size", crosswordSearchParams.size)
  const resolvedSize = size ?? 7
  const isDailyCompleted = useDailyCompleted("crossword", String(resolvedSize))

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <CrosswordSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={crosswordPlayPath(resolvedSize, isDailyCompleted ? "random" : "daily")}
        dailyCompleted={isDailyCompleted}
        statsHref="/games/crossword/stats"
      />
    </GamePageShell>
  )
}
