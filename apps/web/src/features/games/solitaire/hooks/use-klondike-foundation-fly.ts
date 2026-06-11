"use client"

import * as React from "react"

import type {
  KlondikeAutoCompleteMove,
  KlondikeMove,
  KlondikeState,
} from "@pasttime/domain/games/solitaire"

import type { KlondikeFlySession } from "@/features/games/solitaire/components/klondike-fly-overlay"
import {
  KLONDIKE_FOUNDATION_FLY_DURATION_MS,
  KLONDIKE_FOUNDATION_FLY_GAP_MS,
} from "@/features/games/solitaire/lib/klondike-foundation-fly"
import { waitForNextPaint } from "@/features/games/solitaire/lib/klondike-pile-geometry"

const REDUCED_MOTION_GAP_MS = 160
const MEASURE_RETRY_MS = 80

interface UseKlondikeFoundationFlyOptions {
  state: KlondikeState
  getNextBatch: (state: KlondikeState) => readonly KlondikeAutoCompleteMove[]
  applyMoves: (moves: KlondikeMove[]) => void
  onFinished?: (state: KlondikeState) => void
  flyDurationMs?: number
  gapMs?: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function toFlySessions(
  batch: readonly KlondikeAutoCompleteMove[],
): KlondikeFlySession[] {
  return batch.map((entry) => ({
    card: entry.card,
    move: entry.move,
    foundationIndex: entry.foundationIndex,
  }))
}

export function useKlondikeFoundationFly({
  state,
  getNextBatch,
  applyMoves,
  onFinished,
  flyDurationMs = KLONDIKE_FOUNDATION_FLY_DURATION_MS,
  gapMs = KLONDIKE_FOUNDATION_FLY_GAP_MS,
}: UseKlondikeFoundationFlyOptions) {
  const [isActive, setIsActive] = React.useState(false)
  const [flySessions, setFlySessions] = React.useState<KlondikeFlySession[]>([])
  const stateRef = React.useRef(state)
  const runningRef = React.useRef(false)
  const pendingBatchRef = React.useRef<KlondikeAutoCompleteMove[] | null>(null)
  const gapTimeoutRef = React.useRef<number | null>(null)

  React.useLayoutEffect(() => {
    stateRef.current = state
  }, [state])

  const clearGapTimeout = React.useCallback(() => {
    if (gapTimeoutRef.current !== null) {
      window.clearTimeout(gapTimeoutRef.current)
      gapTimeoutRef.current = null
    }
  }, [])

  const finishQueue = React.useCallback(() => {
    clearGapTimeout()
    runningRef.current = false
    pendingBatchRef.current = null
    setIsActive(false)
    setFlySessions([])
    onFinished?.(stateRef.current)
  }, [clearGapTimeout, onFinished])

  const beginBatch = React.useCallback((batch: readonly KlondikeAutoCompleteMove[]) => {
    pendingBatchRef.current = [...batch]
    setFlySessions(toFlySessions(batch))
  }, [])

  const scheduleNextRef = React.useRef<() => void>(() => {})

  const scheduleNext = React.useCallback(() => {
    clearGapTimeout()
    pendingBatchRef.current = null

    const batch = getNextBatch(stateRef.current)
    if (batch.length === 0) {
      finishQueue()
      return
    }

    if (prefersReducedMotion()) {
      applyMoves(batch.map((entry) => entry.move))
      gapTimeoutRef.current = window.setTimeout(
        () => scheduleNextRef.current(),
        REDUCED_MOTION_GAP_MS,
      )
      return
    }

    beginBatch(batch)
  }, [applyMoves, beginBatch, clearGapTimeout, finishQueue, getNextBatch])

  React.useLayoutEffect(() => {
    scheduleNextRef.current = scheduleNext
  }, [scheduleNext])

  const handleComplete = React.useCallback(() => {
    const pending = pendingBatchRef.current
    if (!pending) {
      return
    }

    pendingBatchRef.current = null
    applyMoves(pending.map((entry) => entry.move))
    setFlySessions([])
    gapTimeoutRef.current = window.setTimeout(scheduleNext, gapMs)
  }, [applyMoves, gapMs, scheduleNext])

  const handleMeasureFailed = React.useCallback(() => {
    const pending = pendingBatchRef.current
    if (!pending) {
      return
    }

    setFlySessions([])
    gapTimeoutRef.current = window.setTimeout(() => {
      beginBatch(pending)
    }, MEASURE_RETRY_MS)
  }, [beginBatch])

  const startQueue = React.useCallback(() => {
    if (runningRef.current || flySessions.length > 0) {
      return
    }

    runningRef.current = true
    setIsActive(true)
    void waitForNextPaint().then(() => {
      scheduleNext()
    })
  }, [flySessions.length, scheduleNext])

  const cancelQueue = React.useCallback(() => {
    clearGapTimeout()
    runningRef.current = false
    pendingBatchRef.current = null
    setIsActive(false)
    setFlySessions([])
  }, [clearGapTimeout])

  React.useEffect(() => {
    return () => {
      clearGapTimeout()
    }
  }, [clearGapTimeout])

  const hiddenCardIds = React.useMemo(
    () => new Set(flySessions.map((session) => session.card.id)),
    [flySessions],
  )

  return {
    isActive,
    flySessions,
    hiddenCardIds,
    flyDurationMs,
    handleFlyComplete: handleComplete,
    handleFlyMeasureFailed: handleMeasureFailed,
    startQueue,
    cancelQueue,
  }
}
