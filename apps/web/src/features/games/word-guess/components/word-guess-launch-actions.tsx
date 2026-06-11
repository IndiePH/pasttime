"use client"

import * as React from "react"
import {
  PlatformLink,
  usePlatformRouter,
} from "@/platform/navigation"
import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import { generateRoomCode } from "@pasttime/domain/games"
import {
  wordGuessPlayPath,
  wordGuessRoomPath,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "@pasttime/domain/games/word-guess"
import type { GameDefinition } from "@pasttime/domain/games"
import { GameHowToPlay } from "@/features/games/components/game-how-to-play"
import { JoinRoomPanel } from "@/features/games/components/join-room-panel"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

interface WordGuessLaunchActionsProps {
  game: GameDefinition
}

export function WordGuessLaunchActions({ game }: WordGuessLaunchActionsProps) {
  const router = usePlatformRouter()
  const [showJoinPanel, setShowJoinPanel] = React.useState(false)
  const [lettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const [modeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const wordLength = Number(lettersParam) as WordGuessLength
  const mode = modeParam as WordGuessRoundMode

  function handleCreateRoom() {
    router.push(wordGuessRoomPath(generateRoomCode(), wordLength, mode))
  }

  function roomHrefForCode(code: string): string {
    return wordGuessRoomPath(code, wordLength, mode)
  }

  if (showJoinPanel) {
    return (
      <JoinRoomPanel
        gameId="word-guess"
        roomHrefForCode={roomHrefForCode}
        onCancel={() => setShowJoinPanel(false)}
      />
    )
  }

  return (
    <>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <GameHowToPlay game={game} />
        <Button type="button" className="w-full" asChild>
          <PlatformLink href={wordGuessPlayPath(wordLength, mode)}>Play solo</PlatformLink>
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
      </div>
      <Button variant="outline" className="mt-6" asChild>
        <PlatformLink href="/">Back to catalog</PlatformLink>
      </Button>
    </>
  )
}
