"use client"

import * as React from "react"

import {
  getKlondikeNextAutoCompleteMove,
  isKlondikeAutoCompleteReady,
  type KlondikeMove,
  type KlondikeState,
} from "@pasttime/domain/games/solitaire"

import type { KlondikeFlySession } from "@/features/games/solitaire/components/klondike-fly-overlay"
import {
  getKlondikeFoundationRect,
  getKlondikePileRect,
} from "@/features/games/solitaire/lib/klondike-pile-geometry"

const AUTO_COMPLETE_GAP_MS = 60
const FLY_DURATION_MS = 220
const REDUCED_MOTION_GAP_MS = 16

interface UseKlondikeAutoCompleteOptions {
  state: KlondikeState
  isPlaying: boolean
  applyMove: (move: KlondikeMove) => void
  onComplete: () => void
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useKlondikeAutoComplete({
  state,
  isPlaying,
  applyMove,
  onComplete,
}: UseKlondikeAutoCompleteOptions) {
  const [isAutoCompleting, setIsAutoCompleting] = React.useState(false)
  const [flySession, setFlySession] = React.useState<KlondikeFlySession | null>(
    null,
  )
  const [hiddenCardId, setHiddenCardId] = React.useState<string | null>(null)
  const stateRef = React.useRef(state)
  const runningRef = React.useRef(false)
  const gapTimeoutRef = React.useRef<number | null>(null)

  stateRef.current = state

  const clearGapTimeout = React.useCallback(() => {
    if (gapTimeoutRef.current !== null) {
      window.clearTimeout(gapTimeoutRef.current)
      gapTimeoutRef.current = null
    }
  }, [])

  const finishAutoComplete = React.useCallback(() => {
    clearGapTimeout()
    runningRef.current = false
    setIsAutoCompleting(false)
    setFlySession(null)
    setHiddenCardId(null)
    onComplete()
  }, [clearGapTimeout, onComplete])

  const scheduleNext = React.useCallback(() => {
    clearGapTimeout()

    const current = stateRef.current
    if (current.status === "won") {
      finishAutoComplete()
      return
    }

    const next = getKlondikeNextAutoCompleteMove(current)
    if (!next) {
      finishAutoComplete()
      return
    }

    const reducedMotion = prefersReducedMotion()
    if (reducedMotion) {
      applyMove(next.move)
      gapTimeoutRef.current = window.setTimeout(
        scheduleNext,
        REDUCED_MOTION_GAP_MS,
      )
      return
    }

    const fromRect = getKlondikePileRect(next.from)
    const toRect = getKlondikeFoundationRect(next.foundationIndex)
    if (!fromRect || !toRect) {
      applyMove(next.move)
      gapTimeoutRef.current = window.setTimeout(scheduleNext, AUTO_COMPLETE_GAP_MS)
      return
    }

    setHiddenCardId(next.card.id)
    setFlySession({
      card: next.card,
      move: next.move,
      from: fromRect,
      to: toRect,
    })
  }, [applyMove, clearGapTimeout, finishAutoComplete])

  const handleFlyComplete = React.useCallback(() => {
    setFlySession((current) => {
      if (!current) {
        return null
      }

      applyMove(current.move)
      setHiddenCardId(null)
      gapTimeoutRef.current = window.setTimeout(
        scheduleNext,
        AUTO_COMPLETE_GAP_MS,
      )
      return null
    })
  }, [applyMove, scheduleNext])

  React.useEffect(() => {
    if (!isPlaying || runningRef.current || flySession) {
      return
    }

    if (isKlondikeAutoCompleteReady(state)) {
      runningRef.current = true
      setIsAutoCompleting(true)
      scheduleNext()
    }
  }, [flySession, isPlaying, scheduleNext, state])

  React.useEffect(() => {
    if (state.stock.length > 0) {
      runningRef.current = false
      clearGapTimeout()
      setIsAutoCompleting(false)
      setFlySession(null)
      setHiddenCardId(null)
    }
  }, [clearGapTimeout, state.stock.length])

  React.useEffect(() => {
    return () => {
      clearGapTimeout()
    }
  }, [clearGapTimeout])

  const flyDurationMs = prefersReducedMotion() ? 0 : FLY_DURATION_MS

  return {
    isAutoCompleting,
    flySession,
    hiddenCardId,
    flyDurationMs,
    handleFlyComplete,
  }
}
