"use client"

import { useEffect, useRef } from "react"

import {
  sealPlayClock,
  type PlayClock,
} from "@pasttime/domain/games/shared/play-clock"

/**
 * Saves idle time already spent on the page when the tab is hidden, the page
 * unloads, or the game unmounts. Time after that save is a new segment, so
 * coming back does not rewind the clock and does not count time away.
 */
export function useSealPlayClockOnLeave<T extends PlayClock & { status: string }>(
  state: T | null,
  persist: (sealed: T) => void,
) {
  const stateRef = useRef(state)
  const persistRef = useRef(persist)
  stateRef.current = state
  persistRef.current = persist

  useEffect(() => {
    function seal() {
      const current = stateRef.current
      if (!current || current.status !== "playing") return
      const sealed = sealPlayClock(current)
      if (sealed === current) return
      persistRef.current(sealed)
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") seal()
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", seal)
    return () => {
      seal()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", seal)
    }
  }, [])
}
