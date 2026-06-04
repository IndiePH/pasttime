"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryState } from "nuqs"

import { AdPanel } from "@/components/shared/ad-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@/domain/games"
import {
  formatWordGuessRoundModeLabel,
  formatWordLengthLabel,
  wordGuessLaunchPath,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "@/domain/games/word-guess"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { WordGuessBoard } from "@/features/games/word-guess/components/word-guess-board"
import { WordGuessKeyboard } from "@/features/games/word-guess/components/word-guess-keyboard"
import { useWordGuessGame } from "@/features/games/word-guess/hooks/use-word-guess-game"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

interface WordGuessPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

interface WordGuessPlayCardProps {
  game: GameDefinition
  modeLabel: string
  wordLength: WordGuessLength
  roundMode: WordGuessRoundMode
}

function WordGuessPlayCard({
  game,
  modeLabel,
  wordLength,
  roundMode,
}: WordGuessPlayCardProps) {
  const {
    attemptsUsed,
    boardRows,
    feedback,
    invalidWordShakeCount,
    isPlaying,
    keyboardStates,
    round,
    addLetter,
    removeLetter,
    resetRound,
    submitGuess,
  } = useWordGuessGame({
    wordLength,
    roundMode,
  })
  const modeLabelText = formatWordGuessRoundModeLabel(roundMode)
  const attemptDisplay = Math.min(
    isPlaying ? attemptsUsed + 1 : attemptsUsed,
    round.maxTries,
  )
  const shakeRowIndex =
    invalidWordShakeCount > 0 && isPlaying ? attemptsUsed : null

  return (
    <>
      <GameSessionHeader
        game={game}
        subtitle={`${modeLabel} · ${modeLabelText} · ${formatWordLengthLabel(wordLength)}`}
      />
      <Card className="mt-8 w-full text-left">
        <CardHeader>
          <CardTitle>Game board</CardTitle>
          <CardDescription>
            Guess the hidden word in six tries. Use Enter to submit and
            Backspace to edit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Badge variant="outline">
              Attempt {attemptDisplay} / {round.maxTries}
            </Badge>
            <Badge variant="outline">{modeLabelText}</Badge>
            <Badge variant="outline">{formatWordLengthLabel(wordLength)}</Badge>
          </div>

          <div className="flex justify-center">
            <WordGuessBoard
              rows={boardRows}
              shakeRowIndex={shakeRowIndex}
              shakeTrigger={invalidWordShakeCount}
            />
          </div>

          <p
            className="min-h-5 text-center text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {feedback ?? "\u00A0"}
          </p>

          {round.status === "lost" ? (
            <p className="text-center text-sm text-muted-foreground">
              Answer: <strong>{round.answer}</strong>
            </p>
          ) : null}

          <WordGuessKeyboard
            keyStates={keyboardStates}
            disabled={!isPlaying}
            onLetter={addLetter}
            onEnter={submitGuess}
            onBackspace={removeLetter}
          />

          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={resetRound}>
              {roundMode === "daily" ? "Restart daily round" : "Play again"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function WordGuessPlayView({ game, modeLabel }: WordGuessPlayViewProps) {
  const [lettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const [modeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const wordLength = Number(lettersParam) as WordGuessLength
  const roundMode = modeParam as WordGuessRoundMode
  const sessionKey = `${roundMode}:${wordLength}`
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!isMounted) {
    return (
      <GamePageShell>
        <Card className="mt-8 w-full text-left">
          <CardHeader>
            <CardTitle>Loading game…</CardTitle>
            <CardDescription>
              Preparing your board and saved progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </GamePageShell>
    )
  }

  return (
    <GamePageShell>
      <WordGuessPlayCard
        key={sessionKey}
        game={game}
        modeLabel={modeLabel}
        wordLength={wordLength}
        roundMode={roundMode}
      />
      <Button variant="outline" className="mt-8" asChild>
        <Link href={wordGuessLaunchPath(wordLength, roundMode)}>Back to setup</Link>
      </Button>
      <AdPanel
        slot="game-below-launch"
        variant="box"
        className="mt-10 w-full"
      />
    </GamePageShell>
  )
}
