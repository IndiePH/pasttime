"use client"

import * as React from "react"

const REDUCED_MOTION_GAP_MS = 160
const MEASURE_RETRY_MS = 80

export interface UseMoveQueueOptions<TSession> {
  /** Called each tick to get the next session to animate. Return null to stop. */
  getNext: () => TSession | null
  /** Apply the move represented by the session (called after animation completes). */
  onApply: (session: TSession) => void
  /** Called once the queue is drained (getNext returned null). */
  onFinished?: () => void
  /** Duration of the fly animation in ms. */
  flyDurationMs?: number
  /** Gap between consecutive moves in ms. */
  gapMs?: number
}

export interface MoveQueueHandle<TSession> {
  isActive: boolean
  /** The session currently being animated, or null when idle. */
  session: TSession | null
  flyDurationMs: number
  handleComplete: () => void
  handleMeasureFailed: () => void
  startQueue: () => void
  cancelQueue: () => void
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useMoveQueue<TSession>({
  getNext,
  onApply,
  onFinished,
  flyDurationMs = 800,
  gapMs = 250,
}: UseMoveQueueOptions<TSession>): MoveQueueHandle<TSession> {
  const [isActive, setIsActive] = React.useState(false)
  const [session, setSession] = React.useState<TSession | null>(null)
  const sessionRef = React.useRef(session)
  const runningRef = React.useRef(false)
  const pendingRef = React.useRef<TSession | null>(null)
  const gapTimeoutRef = React.useRef<number | null>(null)

  React.useLayoutEffect(() => {
    sessionRef.current = session
  }, [session])

  const clearGapTimeout = React.useCallback(() => {
    if (gapTimeoutRef.current !== null) {
      window.clearTimeout(gapTimeoutRef.current)
      gapTimeoutRef.current = null
    }
  }, [])

  const finishQueue = React.useCallback(() => {
    clearGapTimeout()
    runningRef.current = false
    pendingRef.current = null
    setIsActive(false)
    setSession(null)
    onFinished?.()
  }, [clearGapTimeout, onFinished])

  const beginSession = React.useCallback((next: TSession) => {
    pendingRef.current = next
    setSession(next)
  }, [])

  const scheduleNext = React.useCallback(() => {
    clearGapTimeout()
    pendingRef.current = null

    const next = getNext()
    if (!next) {
      finishQueue()
      return
    }

    if (prefersReducedMotion()) {
      onApply(next)
      gapTimeoutRef.current = window.setTimeout(scheduleNext, REDUCED_MOTION_GAP_MS)
      return
    }

    beginSession(next)
  }, [beginSession, clearGapTimeout, finishQueue, getNext, onApply])

  const handleComplete = React.useCallback(() => {
    const pending = pendingRef.current
    if (!pending) {
      return
    }

    pendingRef.current = null
    onApply(pending)
    setSession(null)
    gapTimeoutRef.current = window.setTimeout(scheduleNext, gapMs)
  }, [gapMs, onApply, scheduleNext])

  const handleMeasureFailed = React.useCallback(() => {
    const pending = pendingRef.current
    if (!pending) {
      return
    }

    setSession(null)
    gapTimeoutRef.current = window.setTimeout(() => {
      beginSession(pending)
    }, MEASURE_RETRY_MS)
  }, [beginSession])

  const startQueue = React.useCallback(() => {
    if (runningRef.current || sessionRef.current) {
      return
    }

    runningRef.current = true
    setIsActive(true)
    void waitForNextPaint().then(() => {
      scheduleNext()
    })
  }, [scheduleNext])

  const cancelQueue = React.useCallback(() => {
    clearGapTimeout()
    runningRef.current = false
    pendingRef.current = null
    setIsActive(false)
    setSession(null)
  }, [clearGapTimeout])

  React.useEffect(() => {
    return () => {
      clearGapTimeout()
    }
  }, [clearGapTimeout])

  return {
    isActive,
    session,
    flyDurationMs,
    handleComplete,
    handleMeasureFailed,
    startQueue,
    cancelQueue,
  }
}
