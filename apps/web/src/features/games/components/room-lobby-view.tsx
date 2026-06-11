"use client"

import * as React from "react"
import { PlatformLink } from "@/platform/navigation"
import { useQueryState } from "nuqs"
import { Check, Copy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import { gameLaunchPath, getMultiplayerPlayerLimits } from "@pasttime/domain/games"
import {
  formatWordLengthLabel,
  type WordGuessLength,
  type WordGuessRoundMode,
  wordGuessLaunchPath,
} from "@pasttime/domain/games/word-guess"
import { useRoomLobby } from "@/features/games/hooks/use-room-lobby"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

interface RoomLobbyViewProps {
  game: GameDefinition
  roomCode: string
}

export function RoomLobbyView({ game, roomCode }: RoomLobbyViewProps) {
  const [copied, setCopied] = React.useState(false)
  const [lettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const [modeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const { room, loading, error, syncConnected, isHost, startGame } =
    useRoomLobby(roomCode, game.id)

  const isWordGuess = game.id === "word-guess"
  const wordLength = Number(lettersParam) as WordGuessLength
  const mode = modeParam as WordGuessRoundMode
  const launchHref = isWordGuess
    ? wordGuessLaunchPath(wordLength, mode)
    : gameLaunchPath(game.id)
  const limits = getMultiplayerPlayerLimits(game)
  const maxPlayers = limits?.maxPlayers ?? 8
  const minPlayers = limits?.minPlayers ?? 2
  const playerCount = room?.players.length ?? 1
  const canStart = isHost && playerCount >= minPlayers && room?.status === "lobby"

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function handleCopyLink() {
    const link =
      typeof window !== "undefined"
        ? window.location.href
        : launchHref
    try {
      await navigator.clipboard.writeText(
        `Join my ${game.title} room — code ${roomCode}: ${link}`,
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <GamePageShell>
      <GameSessionHeader
        game={game}
        subtitle={
          isWordGuess
            ? `Multiplayer room · ${formatWordLengthLabel(wordLength)}`
            : "Multiplayer room"
        }
      />
      <Card className="mt-8 w-full text-left">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            Room lobby
          </CardTitle>
          <CardDescription>
            Share the code below so friends can join (up to {maxPlayers}{" "}
            players).
            {syncConnected ? " Live sync connected." : " Connecting…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="rounded-lg border border-border/80 bg-muted/30 px-4 py-5 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Room code
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.35em]">
              {roomCode}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleCopyCode}
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Players</span>
            <span>
              {loading ? "…" : playerCount} / {maxPlayers}
            </span>
          </div>

          <ul className="space-y-2 rounded-lg border border-border/80 px-3 py-3">
            {loading ? (
              <li className="text-sm text-muted-foreground">Joining room…</li>
            ) : (
              room?.players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{player.name}</span>
                  {player.isHost ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Host
                    </span>
                  ) : null}
                </li>
              ))
            )}
            {!loading && playerCount < minPlayers ? (
              <li className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>Waiting for players…</span>
              </li>
            ) : null}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={!canStart}
              onClick={() => void startGame()}
            >
              {room?.status === "playing" ? "Game started" : "Start game"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleCopyLink}
            >
              Copy invite
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Start unlocks when at least {minPlayers} players join. Rooms hold
            up to {maxPlayers} players.
          </p>
        </CardContent>
      </Card>

      <Button variant="outline" className="mt-6 w-full max-w-xs" asChild>
        <PlatformLink href={launchHref}>Leave room</PlatformLink>
      </Button>

      <p className="mt-4 max-w-sm text-xs text-muted-foreground">
        Share this page URL or room code{" "}
        <span className="font-mono">{roomCode}</span> so friends can join live.
      </p>
    </GamePageShell>
  )
}
