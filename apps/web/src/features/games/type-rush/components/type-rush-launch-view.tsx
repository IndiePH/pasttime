"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatTypeRushDailyPlayLabel,
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  typeRushPlayPath,
  type TypeRushContentType,
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
  const [contentParam] = useQueryState(
    "content",
    typeRushSearchParams.content
  )
  const mode = modeParam as TypeRushRoundMode
  const contentType = contentParam as TypeRushContentType
  const completionVariant =
    contentType === TYPE_RUSH_CONTENT_TYPE_DEFAULT ? "default" : contentType
  const dailyCompleted = useDailyCompleted("type-rush", completionVariant)
  const playMode = mode === "daily" && !dailyCompleted ? "daily" : "practice"
  const isDailyLaunch = mode === "daily"
  const startsFreshPractice = isDailyLaunch && dailyCompleted

  return (
    <>
      <GamePageShell game={game}>
        <GameSessionHeader game={game} subtitle={game.description} />
        <TypeRushSettingsWidget className="mt-6" />
        <GameLaunchActions
          game={game}
          playHref={typeRushPlayPath(
            playMode,
            contentType,
            startsFreshPractice
          )}
          playLabel={
            isDailyLaunch && !dailyCompleted
              ? formatTypeRushDailyPlayLabel(contentType)
              : "Play"
          }
          dailyCompleted={isDailyLaunch ? dailyCompleted : undefined}
          secondaryAction={
            isDailyLaunch && dailyCompleted
              ? {
                  label: "View Today's Passage",
                  href: typeRushPlayPath("daily", contentType),
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
