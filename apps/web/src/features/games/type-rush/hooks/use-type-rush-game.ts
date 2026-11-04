"use client"

import * as React from "react"

import {
  backspaceTypeRushCharacter,
  createTypeRushRound,
  getTypeRushElapsedMs,
  getTypeRushMetrics,
  getTypeRushStorageKey,
  parseStoredTypeRushRound,
  sealTypeRushRound,
  submitTypeRushCharacter,
  type TypeRushRoundMode,
  type TypeRushRoundState,
} from "@pasttime/domain/games/type-rush"
import { useEngagementRecorder } from "@/features/games/hooks/use-engagement-recorder"
import { useStorage } from "@/infrastructure/storage"

function useLiveElapsed(round: TypeRushRoundState | null): number {
  const [elapsedMs, setElapsedMs] = React.useState(0)

  React.useEffect(() => {
    function syncElapsed() {
      setElapsedMs(round ? getTypeRushElapsedMs(round) : 0)
    }

    syncElapsed()
    if (!round || round.status !== "playing") return

    const interval = window.setInterval(syncElapsed, 250)
    return () => window.clearInterval(interval)
  }, [round])

  return elapsedMs
}

function useSealTypeRushOnLeave(
  round: TypeRushRoundState | null,
  persist: (next: TypeRushRoundState) => void
) {
  const roundRef = React.useRef(round)
  const persistRef = React.useRef(persist)

  React.useLayoutEffect(() => {
    roundRef.current = round
    persistRef.current = persist
  }, [persist, round])

  React.useEffect(() => {
    function seal() {
      const current = roundRef.current
      if (!current || current.status !== "playing") return

      const sealed = sealTypeRushRound(current)
      if (sealed !== current) {
        persistRef.current(sealed)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        seal()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pagehide", seal)
    return () => {
      seal()
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pagehide", seal)
    }
  }, [])
}

export function useTypeRushGame(mode: TypeRushRoundMode) {
  const storage = useStorage()
  const storageKey = React.useMemo(() => getTypeRushStorageKey(mode), [mode])
  const [round, setRound] = React.useState<TypeRushRoundState | null>(null)
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const stored = parseStoredTypeRushRound(storage.get(storageKey), mode)
    const nextRound = stored ?? createTypeRushRound({ mode, now: Date.now() })

    queueMicrotask(() => {
      if (cancelled) return
      setRound(nextRound)
      setLoadedKey(storageKey)
    })

    return () => {
      cancelled = true
    }
  }, [mode, storage, storageKey])

  const persist = React.useCallback(
    (next: TypeRushRoundState) => {
      storage.set(storageKey, next)
    },
    [storage, storageKey]
  )

  React.useEffect(() => {
    if (round && loadedKey === storageKey) {
      persist(round)
    }
  }, [loadedKey, persist, round, storageKey])

  useSealTypeRushOnLeave(round, persist)

  const submitCharacter = React.useCallback((actual: string) => {
    setRound((previous) => {
      if (!previous) return previous
      const next = submitTypeRushCharacter(previous, actual)
      return next === previous ? previous : next
    })
  }, [])

  const backspaceCharacter = React.useCallback(() => {
    setRound((previous) => {
      if (!previous) return previous
      const next = backspaceTypeRushCharacter(previous)
      return next === previous ? previous : next
    })
  }, [])

  const restart = React.useCallback(() => {
    storage.remove(storageKey)
    setLoadedKey(null)
    setRound(null)
    queueMicrotask(() => {
      setRound(createTypeRushRound({ mode, now: Date.now() }))
      setLoadedKey(storageKey)
    })
  }, [mode, storage, storageKey])

  const elapsedMs = useLiveElapsed(round)
  const visibleRound = loadedKey === storageKey ? round : null
  const metrics = visibleRound
    ? getTypeRushMetrics(
        visibleRound,
        visibleRound.status === "playing" ? elapsedMs : visibleRound.elapsedMs
      )
    : null

  useEngagementRecorder({
    gameId: "type-rush",
    variant: "default",
    status: visibleRound?.status ?? "playing",
    isDaily: mode === "daily",
    time:
      visibleRound?.status === "won"
        ? Math.floor(visibleRound.elapsedMs / 1000)
        : undefined,
  })

  return {
    round: visibleRound,
    metrics,
    loadStatus: visibleRound ? ("ready" as const) : ("loading" as const),
    elapsedMs,
    submitCharacter,
    backspaceCharacter,
    restart,
  }
}
