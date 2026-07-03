"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import { generateRoomCode } from "@pasttime/domain/games"
import {
  wordGuessPlayPath,
  wordGuessRoomPath,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "@pasttime/domain/games/word-guess"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { WordGuessSettingsWidget } from "@/features/games/word-guess/components/word-guess-settings-widget"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { useWordGuessDailyCompleted } from "@/features/games/word-guess/hooks/use-word-guess-daily-completed"
import { usePlatformRouter } from "@/platform/navigation"

interface WordGuessLaunchViewProps {
  game: GameDefinition
}

export function WordGuessLaunchView({ game }: WordGuessLaunchViewProps) {
  const router = usePlatformRouter()
  const [lettersParam] = useQueryState("letters", wordGuessSearchParams.letters)
  const [modeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const [hardModeParam] = useQueryState("hardMode", wordGuessSearchParams.hardMode)
  const wordLength = Number(lettersParam) as WordGuessLength
  const mode = modeParam as WordGuessRoundMode
  const appliedHardMode: boolean = hardModeParam ?? false
  const isDailyCompleted = useWordGuessDailyCompleted(wordLength)
  const playMode = isDailyCompleted ? "random" : "daily"

  function handleCreateRoom() {
    router.push(wordGuessRoomPath(generateRoomCode(), wordLength, mode))
  }

  return (
    <GamePageShell>
      <GameSessionHeader game={game} subtitle={game.description} />
      <WordGuessSettingsWidget className="mt-6" />
      <GameLaunchActions
        game={game}
        playHref={wordGuessPlayPath(wordLength, playMode, appliedHardMode || undefined)}
        dailyCompleted={isDailyCompleted}
        secondaryAction={
          isDailyCompleted
            ? { label: "View today's results", href: wordGuessPlayPath(wordLength, "daily", appliedHardMode ? true : undefined) }
            : undefined
        }
        statsHref="/games/word-guess/stats"
        onCreateRoom={handleCreateRoom}
        onJoinRoom={() => {}}
      />
    </GamePageShell>
  )
}
