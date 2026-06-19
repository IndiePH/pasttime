"use client"

import * as React from "react"
import { PlatformLink } from "@/platform/navigation"
import { useQueryState } from "nuqs"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatWordGuessRoundModeLabel,
  formatWordLengthLabel,
  wordGuessLaunchPath,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "@pasttime/domain/games/word-guess"
import { GameContentPanel } from "@/features/games/components/game-content-panel"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { WordGuessBoard } from "@/features/games/word-guess/components/word-guess-board"
import { WordGuessKeyboard } from "@/features/games/word-guess/components/word-guess-keyboard"
import { useWordGuessGame } from "@/features/games/word-guess/hooks/use-word-guess-game"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

interface WordGuessPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

interface WordGuessPlayCardProps {
  wordLength: WordGuessLength
  roundMode: WordGuessRoundMode
}

const SIDE_INSET = "0.75rem"

function WordGuessPlayCard({
  wordLength,
  roundMode,
  session,
}: WordGuessPlayCardProps & {
  session: ReturnType<typeof useWordGuessGame>
}) {
  const {
    attemptsUsed,
    boardRows,
    feedback,
    invalidWordShake,
    isPlaying,
    keyboardStates,
    round,
    addLetter,
    removeLetter,
    submitGuess,
  } = session
  const modeLabelText = formatWordGuessRoundModeLabel(roundMode)
  const attemptDisplay = Math.min(
    isPlaying ? attemptsUsed + 1 : attemptsUsed,
    round.maxTries,
  )
  const shakeRowIndex = isPlaying ? (invalidWordShake?.rowIndex ?? null) : null
  const shakeTrigger = invalidWordShake?.trigger ?? 0

  return (
    <Card className="word-guess-vars mx-auto overflow-visible text-left">
      <CardHeader
        className="gap-3 pt-2 landscape:flex-row landscape:items-start landscape:justify-between landscape:space-y-0"
        style={{ paddingInline: SIDE_INSET }}
      >
        <div className="space-y-1.5">
          <CardTitle>Game board</CardTitle>
          <CardDescription className="max-w-2xl landscape:hidden">
            Guess the hidden word in six tries. Use Enter to submit and Backspace
            to edit.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 py-0.5 text-sm landscape:justify-end">
          <Badge variant="outline" className="leading-normal">
            Attempt {attemptDisplay} / {round.maxTries}
          </Badge>
          <Badge variant="outline" className="leading-normal">
            {modeLabelText}
          </Badge>
          <Badge variant="outline" className="leading-normal">
            {formatWordLengthLabel(wordLength)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pt-4 pb-2 landscape:space-y-3 landscape:pt-3 landscape:pb-2">
        <GameContentPanel sideInset={SIDE_INSET}>
          <div className="flex justify-center">
            <WordGuessBoard
              rows={boardRows}
              shakeRowIndex={shakeRowIndex}
              shakeTrigger={shakeTrigger}
            />
          </div>
        </GameContentPanel>

        <div
          className="flex flex-col items-center gap-2"
          style={{ paddingInline: SIDE_INSET }}
        >
          <p
            className="min-h-5 w-full text-center text-sm text-muted-foreground"
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
        </div>

        <div style={{ paddingInline: SIDE_INSET }}>
          <WordGuessKeyboard
            keyStates={keyboardStates}
            disabled={!isPlaying}
            onLetter={addLetter}
            onEnter={submitGuess}
            onBackspace={removeLetter}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function WordGuessPlaySession({
  game,
  modeLabel,
  wordLength,
  roundMode,
}: WordGuessPlayCardProps & {
  game: GameDefinition
  modeLabel: string
}) {
  const session = useWordGuessGame({ wordLength, roundMode })

  const modeLabelText = formatWordGuessRoundModeLabel(roundMode)

  return (
    <GamePlaySection
      game={game}
      subtitle={`${modeLabel} · ${modeLabelText} · ${formatWordLengthLabel(wordLength)}`}
      headerDensity="compact"
      contentLayout="board"
      footer={
        <GamePlayFooterActions>
          {roundMode !== "daily" && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={session.resetRound}
            >
              Play again
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={wordGuessLaunchPath(wordLength, roundMode)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      }
    >
      <WordGuessPlayCard
        wordLength={wordLength}
        roundMode={roundMode}
        session={session}
      />
    </GamePlaySection>
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
      <GamePlayShell layout="board">
        <Card className="word-guess-vars mx-auto w-full text-left">
          <CardHeader>
            <CardTitle>Loading game…</CardTitle>
            <CardDescription>
              Preparing your board and saved progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </GamePlayShell>
    )
  }

  return (
    <GamePlayShell layout="board">
      <WordGuessPlaySession
        key={sessionKey}
        game={game}
        modeLabel={modeLabel}
        wordLength={wordLength}
        roundMode={roundMode}
      />
    </GamePlayShell>
  )
}
