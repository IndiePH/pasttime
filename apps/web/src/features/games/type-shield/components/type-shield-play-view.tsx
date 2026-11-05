"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import type { GameDefinition } from "@pasttime/domain/games"
import { typeShieldLaunchPath } from "@pasttime/domain/games/type-shield"
import { Button } from "@/components/ui/button"
import { GameBoardLoading } from "@/features/games/components/game-board-loading"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { useTypingHandheldNotice } from "@/features/games/components/typing-handheld-notice"
import { TypeShieldPlayPreferencesProvider } from "@/features/games/type-shield/hooks/use-type-shield-play-preferences"
import { useTypeShieldGame } from "@/features/games/type-shield/hooks/use-type-shield-game"
import { PlatformLink } from "@/platform/navigation"

import { TypeShieldStage } from "./type-shield-stage"

interface TypeShieldPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

export function TypeShieldPlayView({
  game,
  modeLabel,
}: TypeShieldPlayViewProps) {
  return (
    <TypeShieldPlayPreferencesProvider>
      <TypeShieldPlaySession game={game} modeLabel={modeLabel} />
    </TypeShieldPlayPreferencesProvider>
  )
}

function TypeShieldPlaySession({
  game,
  modeLabel,
}: TypeShieldPlayViewProps) {
  const noticePhase = useTypingHandheldNotice(game.id)
  const shield = useTypeShieldGame({ holdStart: noticePhase !== "closed" })
  const reduceMotion = useReducedMotion()
  const stageRef = React.useRef<HTMLDivElement>(null)
  const previousLives = React.useRef<number | null>(null)
  const [shake, setShake] = React.useState(0)

  React.useEffect(() => {
    if (noticePhase === "closed") {
      stageRef.current?.focus()
    }
  }, [noticePhase, shield.loadStatus])

  const playing = shield.round?.status === "playing" && shield.countdown === null
  const submitCharacter = shield.submitCharacter
  const backspaceCharacter = shield.backspaceCharacter

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!playing || noticePhase !== "closed") {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return
      }
      if (document.getElementById("type-shield-play-settings-panel")) {
        return
      }
      if (event.key === "Backspace") {
        event.preventDefault()
        backspaceCharacter()
        return
      }
      if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
        event.preventDefault()
        submitCharacter(event.key)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [backspaceCharacter, noticePhase, playing, submitCharacter])

  React.useEffect(() => {
    const lives = shield.round?.lives
    if (lives === undefined) {
      return
    }
    if (previousLives.current !== null && lives < previousLives.current) {
      setShake((value) => value + 1)
    }
    previousLives.current = lives
  }, [shield.round?.lives])

  if (shield.loadStatus === "loading" || !shield.round) {
    return (
      <GamePlayShell className="w-full max-w-5xl" sideBanner={false} game={game}>
        <GameBoardLoading label="Raising the shield…" />
      </GamePlayShell>
    )
  }

  const lost = shield.round.status === "lost"
  const won = shield.round.status === "won"

  return (
    <GamePlayShell className="w-full max-w-5xl" sideBanner={false} game={game}>
      <GamePlaySection
        game={game}
        subtitle={`${modeLabel} · Defend The Dome`}
        headerDensity="compact"
        contentClassName="w-full max-w-none"
        footer={
          <GamePlayFooterActions>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={shield.restart}
            >
              New Game
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <PlatformLink href={typeShieldLaunchPath()}>
                Back To Setup
              </PlatformLink>
            </Button>
          </GamePlayFooterActions>
        }
      >
        <div ref={stageRef} tabIndex={0} className="relative w-full outline-none">
          <TypeShieldStage round={shield.round} now={shield.now} shake={shake} />
          {shield.countdown !== null ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/55"
              role="status"
              aria-live="polite"
              aria-label={`Starting in ${shield.countdown}`}
            >
              <p className="text-sm font-medium tracking-wide text-white/80">
                Get Ready
              </p>
              <motion.p
                key={shield.countdown}
                className="mt-1 text-7xl font-semibold tabular-nums text-white"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
              >
                {shield.countdown}
              </motion.p>
            </div>
          ) : null}
          {lost || won ? (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-slate-950/65 px-6"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="max-w-sm rounded-xl border border-white/15 bg-slate-950/90 px-6 py-5 text-center text-white">
                <h2 className="text-xl font-semibold">
                  {won ? "The dome held" : "The dome fell"}
                </h2>
                <p className="mt-2 text-sm text-white/75">
                  Score {shield.round.score}. You cleared {shield.round.destroyed}{" "}
                  {shield.round.destroyed === 1 ? "comet" : "comets"}.
                </p>
                <Button
                  type="button"
                  className="mt-4 w-full"
                  onClick={shield.restart}
                >
                  New Game
                </Button>
              </div>
            </motion.div>
          ) : null}
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Type a comet’s word to destroy it. Shared letters light up on every
          comet they fit. Backspace erases the last letter.
        </p>
      </GamePlaySection>
    </GamePlayShell>
  )
}
