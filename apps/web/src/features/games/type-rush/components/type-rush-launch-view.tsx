"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  typeRushPlayPath,
  type TypeRushRoundMode,
} from "@pasttime/domain/games/type-rush"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameOverviewSection } from "@/features/games/content/game-overview-section"
import { useDailyCompleted } from "@/features/games/hooks/use-daily-completed"
import { typeRushSearchParams } from "@/features/games/type-rush/search-params"
import { TypeRushSettingsWidget } from "./type-rush-settings-widget"

interface TypeRushLaunchViewProps {
  game: GameDefinition
}

export function TypeRushLaunchView({ game }: TypeRushLaunchViewProps) {
  const [modeParam] = useQueryState("mode", typeRushSearchParams.mode)
  const mode = modeParam as TypeRushRoundMode
  const dailyCompleted = useDailyCompleted("type-rush", "default")
  const playMode = mode === "daily" && !dailyCompleted ? "daily" : "practice"
  const isDailyLaunch = mode === "daily"

  return (
    <>
      <GamePageShell>
        <GameSessionHeader game={game} subtitle={game.description} />
        <TypeRushSettingsWidget className="mt-6" />
        <GameLaunchActions
          game={game}
          playHref={typeRushPlayPath(playMode)}
          playLabel={
            isDailyLaunch && !dailyCompleted
              ? "Play daily passage"
              : "Start practice"
          }
          dailyCompleted={isDailyLaunch ? dailyCompleted : undefined}
          secondaryAction={
            isDailyLaunch && dailyCompleted
              ? {
                  label: "View today's passage",
                  href: typeRushPlayPath("daily"),
                }
              : undefined
          }
          statsHref="/games/type-rush/stats"
        />
      </GamePageShell>
      <GameOverviewSection gameId={game.id} gameTitle={game.title} />
    </>
  )
}
