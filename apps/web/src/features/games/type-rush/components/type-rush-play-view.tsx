"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatPlayElapsed,
  getTypingCharacterStatus,
} from "@pasttime/domain/games/shared"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatTypeRushRoundModeLabel,
  typeRushLaunchPath,
  type TypeRushRoundMode,
} from "@pasttime/domain/games/type-rush"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameBoardLoading } from "@/features/games/components/game-board-loading"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { typeRushSearchParams } from "@/features/games/type-rush/search-params"
import { useTypeRushGame } from "@/features/games/type-rush/hooks/use-type-rush-game"
import { PlatformLink } from "@/platform/navigation"

interface TypeRushPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`
}

export function TypeRushPlayView({ game, modeLabel }: TypeRushPlayViewProps) {
  const [modeParam] = useQueryState("mode", typeRushSearchParams.mode)
  const mode = modeParam as TypeRushRoundMode
  const typeRush = useTypeRushGame(mode)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (typeRush.round) {
      inputRef.current?.focus()
    }
  }, [typeRush.round])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault()
      typeRush.backspaceCharacter()
      return
    }

    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    typeRush.submitCharacter(event.key)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    for (const character of value) {
      typeRush.submitCharacter(character)
    }
    event.currentTarget.value = ""
  }

  if (
    typeRush.loadStatus === "loading" ||
    !typeRush.round ||
    !typeRush.metrics
  ) {
    return <GameBoardLoading label="Loading Type Rush…" />
  }

  const { round, metrics } = typeRush
  const isPlaying = round.status === "playing"

  return (
    <GamePlayShell>
      <GameSessionHeader
        game={game}
        subtitle={`${modeLabel} · ${formatTypeRushRoundModeLabel(mode)}`}
        density="compact"
      />

      <Card className="mt-6 w-full text-left">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Type Rush</CardTitle>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatPlayElapsed(metrics.elapsedMs)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <div className="font-semibold tabular-nums">
                {formatAccuracy(metrics.accuracy)}
              </div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <div className="font-semibold tabular-nums">
                {metrics.wpm.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </div>
            <div className="rounded-lg bg-muted/50 px-2 py-2">
              <div className="font-semibold tabular-nums">
                {metrics.processedChars}/{round.text.length}
              </div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="relative w-full rounded-lg border border-border/70 bg-background p-4 text-left font-mono text-base leading-8 tracking-wide transition-colors focus-within:border-primary/50">
            <div className="whitespace-pre-wrap" aria-hidden>
              {Array.from(round.text).map((character, index) => {
                const status = getTypingCharacterStatus(round.typing, index)

                return (
                  <span
                    key={`${index}-${character}`}
                    className={
                      status === "correct"
                        ? "text-foreground"
                        : status === "incorrect"
                          ? "rounded bg-destructive/20 text-destructive underline decoration-wavy"
                          : status === "current"
                            ? "rounded bg-primary/15 text-primary underline decoration-primary decoration-2 underline-offset-4"
                            : "text-muted-foreground/60"
                    }
                  >
                    {character}
                  </span>
                )
              })}
            </div>
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Type the passage"
              className="absolute inset-0 z-10 size-full cursor-text border-0 bg-transparent text-transparent caret-transparent opacity-[0.01] outline-none"
              disabled={!isPlaying}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <p
            className="min-h-5 text-center text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {isPlaying
              ? "Click the passage and type every character."
              : `Complete in ${formatPlayElapsed(round.elapsedMs)} at ${formatAccuracy(metrics.accuracy)} accuracy.`}
          </p>
        </CardContent>
      </Card>

      <GamePlayFooterActions>
        <Button type="button" className="w-full" onClick={typeRush.restart}>
          {isPlaying ? "Restart passage" : "Try again"}
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <PlatformLink href={typeRushLaunchPath(mode)}>
            Back to setup
          </PlatformLink>
        </Button>
      </GamePlayFooterActions>
    </GamePlayShell>
  )
}
