"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@pasttime/domain/games"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { JoinRoomPanel } from "@/features/games/components/join-room-panel"
import { PlatformLink } from "@/platform/navigation"

interface GameLaunchActionsProps {
  game: GameDefinition
  /** Href for the primary play button. */
  playHref: string
  /** Override the auto-derived play button label. */
  playLabel?: string
  /** Whether the daily puzzle has been completed — derived label when provided. */
  dailyCompleted?: boolean
  /** Optional secondary action link (e.g. "View today's results"). */
  secondaryAction?: {
    label: string
    href: string
  }
  /** Optional href for the stats page link. */
  statsHref?: string
  /** Multiplayer: create room handler. */
  onCreateRoom?: () => void
  /** Multiplayer: join room handler. */
  onJoinRoom?: () => void
}

export function GameLaunchActions({
  game,
  playHref,
  playLabel: playLabelProp,
  dailyCompleted,
  secondaryAction,
  statsHref,
  onCreateRoom,
  onJoinRoom,
}: GameLaunchActionsProps) {
  const [showJoinPanel, setShowJoinPanel] = React.useState(false)

  // Derive play button label
  const playLabel = React.useMemo(() => {
    if (playLabelProp) return playLabelProp
    if (dailyCompleted !== undefined) {
      return dailyCompleted ? "Play puzzle" : "Play daily puzzle"
    }
    return "Play"
  }, [playLabelProp, dailyCompleted])

  // Room handlers with internal panel state
  const handleCreateRoom = React.useCallback(() => {
    onCreateRoom?.()
  }, [onCreateRoom])

  const handleJoinRoom = React.useCallback(() => {
    setShowJoinPanel(true)
    onJoinRoom?.()
  }, [onJoinRoom])

  const handleJoinCancel = React.useCallback(() => {
    setShowJoinPanel(false)
  }, [])

  // Render join room panel when active
  if (showJoinPanel) {
    return (
      <>
        <JoinRoomPanel
          gameId={game.id}
          roomHrefForCode={() => ""}
          onCancel={handleJoinCancel}
        />
        <Button variant="outline" className="mt-6 w-60 self-center" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      </>
    )
  }

  return (
    <>
      <div className="mt-8 flex w-60 flex-col gap-3">
        <GameHowToPlay game={game} />
        <Button type="button" className="w-full" asChild>
          <PlatformLink href={playHref}>{playLabel}</PlatformLink>
        </Button>
        {secondaryAction ? (
          <Button type="button" variant="secondary" className="w-full" asChild>
            <PlatformLink href={secondaryAction.href}>
              {secondaryAction.label}
            </PlatformLink>
          </Button>
        ) : null}
        {onCreateRoom ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleCreateRoom}
          >
            Create room
          </Button>
        ) : null}
        {onJoinRoom ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleJoinRoom}
          >
            Join room
          </Button>
        ) : null}
      </div>
      <GamePlayFooterActions className="mt-3">
        {statsHref ? (
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={statsHref}>Stats</PlatformLink>
          </Button>
        ) : null}
        <Button variant="outline" className="w-full" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      </GamePlayFooterActions>
    </>
  )
}
