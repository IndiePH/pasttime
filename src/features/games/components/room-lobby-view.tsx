"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryState } from "nuqs"
import { Check, Copy, Users } from "lucide-react"

import { AdPanel } from "@/components/shared/ad-panel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@/domain/games"
import { gameLaunchPath, getMultiplayerPlayerLimits } from "@/domain/games"
import {
  formatWordLengthLabel,
  type WordGuessLength,
  type WordGuessRoundMode,
  wordGuessLaunchPath,
} from "@/domain/games/word-guess"
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
  const isWordGuess = game.id === "word-guess"
  const wordLength = Number(lettersParam) as WordGuessLength
  const mode = modeParam as WordGuessRoundMode
  const launchHref = isWordGuess
    ? wordGuessLaunchPath(wordLength, mode)
    : gameLaunchPath(game.id)
  const limits = getMultiplayerPlayerLimits(game)
  const maxPlayers = limits?.maxPlayers ?? 8
  const minPlayers = limits?.minPlayers ?? 2

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
    const path = launchHref
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path
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
            players). Multiplayer sync is not connected yet — this lobby
            previews the flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              1 / {maxPlayers}
            </span>
          </div>

          <ul className="space-y-2 rounded-lg border border-border/80 px-3 py-3">
            <li className="flex items-center justify-between gap-3 text-sm">
              <span>You</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Host
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Waiting for players…</span>
            </li>
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" className="flex-1" disabled>
              Start game
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
        <Link href={launchHref}>Leave room</Link>
      </Button>

      <p className="mt-4 max-w-sm text-xs text-muted-foreground">
        The invite link opens the game launch screen.
        <br />
        Friends tap <strong className="font-semibold">Join room</strong> and enter{" "}
        <span className="font-mono">{roomCode}</span>.
      </p>
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
