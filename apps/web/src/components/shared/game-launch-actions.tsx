"use client"

import * as React from "react"
import {
  PlatformLink,
  usePlatformRouter,
} from "@/platform/navigation"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  gamePlayPath,
  gameRoomPath,
  generateRoomCode,
  isMultiplayerGame,
} from "@pasttime/domain/games"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { JoinRoomPanel } from "@/features/games/components/join-room-panel"

export function GameLaunchActions({ game }: { game: GameDefinition }) {
  const router = usePlatformRouter()
  const [showJoinPanel, setShowJoinPanel] = React.useState(false)

  if (game.status === "coming_soon") {
    return (
      <>
        <p className="mt-8 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
          Coming soon
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      </>
    )
  }

  const multiplayer = isMultiplayerGame(game)

  function handleCreateRoom() {
    router.push(gameRoomPath(game.id, generateRoomCode()))
  }

  return (
    <>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <GameHowToPlay game={game} />
        {multiplayer ? (
          showJoinPanel ? (
            <JoinRoomPanel
              gameId={game.id}
              onCancel={() => setShowJoinPanel(false)}
            />
          ) : (
            <>
              <Button type="button" className="w-full" asChild>
                <PlatformLink href={gamePlayPath(game.id)}>Play solo</PlatformLink>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleCreateRoom}
              >
                Create room
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowJoinPanel(true)}
              >
                Join room
              </Button>
            </>
          )
        ) : (
          <Button type="button" className="w-full" asChild>
            <PlatformLink href={gamePlayPath(game.id)}>Play</PlatformLink>
          </Button>
        )}
      </div>
      {!showJoinPanel ? (
        <Button variant="outline" className="mt-6" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      ) : null}
    </>
  )
}
