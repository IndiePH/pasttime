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
import { getEnrichedWord } from "@pasttime/domain/games/shared"
import {
  formatWordGuessRoundModeLabel,
  formatWordLengthLabel,
  getWordGuessSoloStorageKey,
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
import { WordGuessPlayPreferencesProvider, useWordGuessPlayPreferences } from "@/features/games/word-guess/context/word-guess-play-preferences-context"
import { useWordGuessGame } from "@/features/games/word-guess/hooks/use-word-guess-game"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { useStorage } from "@/infrastructure/storage"

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
  hardMode = false,
}: WordGuessPlayCardProps & {
  session: ReturnType<typeof useWordGuessGame>
  hardMode?: boolean
}) {
  const { flipEnabled } = useWordGuessPlayPreferences()
  const {
    attemptsUsed,
    boardRows,
    feedback,
    flipRowIndex,
    flipTrigger,
    invalidWordShake,
    isPlaying,
    keyboardStates,
    round,
    addLetter,
    removeLetter,
    submitGuess,
  } = session

  // Prevent stale flip animation when flipEnabled is toggled ON after guesses
  // were already made with it OFF. Track the flipTrigger value at the moment
  // flipEnabled becomes true — only newer triggers (from new guesses) animate.
  const prevFlipEnabledRef = React.useRef(flipEnabled)
  const flipEpochTriggerRef = React.useRef(0)
  if (flipEnabled && !prevFlipEnabledRef.current) {
    flipEpochTriggerRef.current = flipTrigger
  }
  prevFlipEnabledRef.current = flipEnabled
  const effectiveFlipRowIndex =
    flipEnabled && flipTrigger > flipEpochTriggerRef.current
      ? flipRowIndex
      : null
  const modeLabelText = formatWordGuessRoundModeLabel(roundMode)
  const attemptDisplay = Math.min(
    isPlaying ? attemptsUsed + 1 : attemptsUsed,
    round.maxTries,
  )
  const shakeRowIndex = isPlaying ? (invalidWordShake?.rowIndex ?? null) : null
  const shakeTrigger = invalidWordShake?.trigger ?? 0

  // Look up the answer definition for the post-game reveal
  const answerEntry = round.status !== "playing" ? getEnrichedWord(round.answer) : null
  const answerDefinition = answerEntry?.definition ?? null

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
          {hardMode && (
            <Badge variant="default" className="leading-normal">
              Hard mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pt-4 pb-2 landscape:space-y-3 landscape:pt-3 landscape:pb-2">
        <GameContentPanel sideInset={SIDE_INSET}>
          <div className="flex justify-center">
            <WordGuessBoard
              rows={boardRows}
              shakeRowIndex={shakeRowIndex}
              shakeTrigger={shakeTrigger}
              flipRowIndex={effectiveFlipRowIndex}
              flipTrigger={flipTrigger}
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

          {answerDefinition ? (
            <p className="mx-auto max-w-sm text-center text-xs italic text-muted-foreground/80">
              {answerDefinition}
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
  const [hardModeParam] = useQueryState("hardMode", wordGuessSearchParams.hardMode)
  const appliedHardMode: boolean = hardModeParam ?? false
  const { flipEnabled } = useWordGuessPlayPreferences()
  const session = useWordGuessGame({ wordLength, roundMode, hardMode: appliedHardMode })

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
              New game
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={wordGuessLaunchPath(wordLength, roundMode, appliedHardMode ? true : undefined)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      }
    >
      <WordGuessPlayCard
        wordLength={wordLength}
        roundMode={roundMode}
        hardMode={appliedHardMode}
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
  const storage = useStorage()

  // When entering daily mode, clear any lingering endless-mode session
  // so the player starts fresh when they return to endless later.
  React.useEffect(() => {
    if (roundMode === "daily") {
      const randomKey = getWordGuessSoloStorageKey(wordLength, "random")
      storage.remove(randomKey)
    }
  }, [roundMode, wordLength, storage])

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
      <WordGuessPlayPreferencesProvider>
        <WordGuessPlaySession
          key={sessionKey}
          game={game}
          modeLabel={modeLabel}
          wordLength={wordLength}
          roundMode={roundMode}
        />
      </WordGuessPlayPreferencesProvider>
    </GamePlayShell>
  )
}
