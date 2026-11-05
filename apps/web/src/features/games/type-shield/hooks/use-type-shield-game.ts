"use client"

import * as React from "react"

import { hashSeed } from "@pasttime/domain/daily"
import {
  advanceTypeShield,
  backspaceTypeShieldCharacter,
  createTypeShieldRound,
  submitTypeShieldCharacter,
  TYPE_SHIELD_MAX_LIVES,
  type TypeShieldDifficulty,
  type TypeShieldMode,
  type TypeShieldState,
} from "@pasttime/domain/games/type-shield"
import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { useTypeShieldPlayPreferences } from "@/features/games/type-shield/hooks/use-type-shield-play-preferences"
import { loadTypeShieldDictionary } from "@/features/games/type-shield/load-dictionary"

const COUNTDOWN_MS = 3000

interface TypeShieldSession {
  now: number
  round: TypeShieldState
}

function previewRound(
  difficulty: TypeShieldDifficulty,
  words: readonly string[],
  mode: TypeShieldMode,
): TypeShieldState {
  return {
    status: "playing",
    lives: TYPE_SHIELD_MAX_LIVES,
    score: 0,
    destroyed: 0,
    comets: [],
    nextSpawnAt: Number.MAX_SAFE_INTEGER,
    spawnCount: 0,
    seed: 0,
    startedAt: 0,
    difficulty,
    mode,
    words,
  }
}

function countdownSeconds(beginsAt: number, clock: number): number {
  const elapsedClock = clock || beginsAt - COUNTDOWN_MS
  return Math.max(1, Math.ceil((beginsAt - elapsedClock) / 1000))
}

function freshSession(
  now: number,
  difficulty: TypeShieldDifficulty,
  words: readonly string[],
  mode: TypeShieldMode,
): TypeShieldSession {
  return {
    now,
    round: createTypeShieldRound({
      now,
      seed: hashSeed(now),
      difficulty,
      words,
      mode,
    }),
  }
}

function useIsClient(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function useTypeShieldGame(options?: { holdStart?: boolean }) {
  const holdStart = options?.holdStart ?? false
  const isClient = useIsClient()
  const { difficulty, mode } = useTypeShieldPlayPreferences()
  const [session, setSession] = React.useState<TypeShieldSession | null>(null)
  const [roster, setRoster] = React.useState<readonly string[] | null>(null)
  const [trackedDifficulty, setTrackedDifficulty] =
    React.useState(difficulty)
  const [trackedMode, setTrackedMode] = React.useState(mode)
  const [beginsAt, setBeginsAt] = React.useState<number | null>(null)
  const [clock, setClock] = React.useState(0)
  const beginsAtRef = React.useRef<number | null>(null)
  const rosterRef = React.useRef(roster)
  const difficultyRef = React.useRef(difficulty)
  const modeRef = React.useRef(mode)

  React.useLayoutEffect(() => {
    rosterRef.current = roster
    difficultyRef.current = difficulty
    modeRef.current = mode
    beginsAtRef.current = beginsAt
  }, [beginsAt, difficulty, mode, roster])

  React.useEffect(() => {
    let cancelled = false
    void loadTypeShieldDictionary().then((words) => {
      if (!cancelled) {
        setRoster(words)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (difficulty !== trackedDifficulty || mode !== trackedMode) {
    setTrackedDifficulty(difficulty)
    setTrackedMode(mode)
    if (roster && (session || beginsAt !== null)) {
      setSession(null)
      setBeginsAt(clock === 0 ? null : clock + COUNTDOWN_MS)
    }
  }

  if (
    isClient &&
    roster &&
    session === null &&
    beginsAt === null &&
    !holdStart &&
    clock !== 0
  ) {
    setBeginsAt(clock + COUNTDOWN_MS)
  }

  React.useEffect(() => {
    let frame = 0
    const tick = () => {
      const now = Date.now()
      const armedAt = beginsAtRef.current
      const words = rosterRef.current
      if (armedAt !== null && words && now >= armedAt) {
        beginsAtRef.current = null
        setBeginsAt(null)
        setSession(
          freshSession(now, difficultyRef.current, words, modeRef.current),
        )
      } else if (armedAt === null) {
        setSession((current) =>
          current
            ? { now, round: advanceTypeShield(current.round, now) }
            : current
        )
      }
      setClock(now)
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const submitCharacter = React.useCallback((actual: string) => {
    const now = Date.now()
    setSession((current) =>
      current
        ? {
            now,
            round: submitTypeShieldCharacter(current.round, actual, now),
          }
        : current
    )
  }, [])

  const backspaceCharacter = React.useCallback(() => {
    setSession((current) =>
      current
        ? { ...current, round: backspaceTypeShieldCharacter(current.round) }
        : current
    )
  }, [])

  const restart = React.useCallback(() => {
    if (!roster) return
    const nextBeginsAt = Date.now() + COUNTDOWN_MS
    beginsAtRef.current = nextBeginsAt
    setBeginsAt(nextBeginsAt)
    setSession(null)
  }, [roster])

  const finishedSession =
    session?.round.status === "lost" || session?.round.status === "won"
      ? session
      : null

  useEngagementRecorder({
    gameId: "type-shield",
    variant: finishedSession?.round.difficulty ?? difficulty,
    status: session?.round.status ?? null,
    isDaily: false,
    enabled: true,
    time: finishedSession
      ? Math.max(
          0,
          Math.floor((finishedSession.now - finishedSession.round.startedAt) / 1000),
        )
      : undefined,
  })

  const countingDown = beginsAt !== null
  const round =
    session?.round ?? (roster ? previewRound(difficulty, roster, mode) : null)

  return {
    loadStatus: roster ? ("ready" as const) : ("loading" as const),
    round,
    now: session?.now ?? clock,
    countdown: countingDown ? countdownSeconds(beginsAt, clock) : null,
    submitCharacter,
    backspaceCharacter,
    restart,
  }
}
