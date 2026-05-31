"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type { GameDefinition } from "@/domain/games"
import {
  gamePlayPath,
  gameRoomPath,
  generateRoomCode,
  isMultiplayerGame,
} from "@/domain/games"
import { JoinRoomPanel } from "@/features/games/components/join-room-panel"

export function GameLaunchActions({ game }: { game: GameDefinition }) {
  const router = useRouter()
  const [showJoinPanel, setShowJoinPanel] = React.useState(false)

  if (game.status === "coming_soon") {
    return (
      <>
        <p className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
          Coming soon
        </p>
        <Button variant="outline" className="mt-8" asChild>
          <Link href="/">Back to catalog</Link>
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
        {multiplayer ? (
          showJoinPanel ? (
            <JoinRoomPanel
              gameId={game.id}
              onCancel={() => setShowJoinPanel(false)}
            />
          ) : (
            <>
              <Button type="button" className="w-full" asChild>
                <Link href={gamePlayPath(game.id)}>Play solo</Link>
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
            <Link href={gamePlayPath(game.id)}>Play</Link>
          </Button>
        )}
      </div>
      {!showJoinPanel ? (
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/">Back to catalog</Link>
        </Button>
      ) : null}
    </>
  )
}
