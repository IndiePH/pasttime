"use client"

import { useEffect, useState } from "react"

import {
  livePlayElapsedMs,
  type PlayClock,
} from "@pasttime/domain/games/shared/play-clock"

/** Ticks once a second while `status` is playing. Reads the clock inside the effect. */
export function useLivePlayElapsed(
  clock: (PlayClock & { status: string }) | null,
): number {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    function syncElapsed() {
      if (!clock) {
        setElapsedMs(0)
        return
      }
      setElapsedMs(livePlayElapsedMs(clock, clock.status))
    }

    syncElapsed()
    if (!clock || clock.status !== "playing") return
    const interval = setInterval(syncElapsed, 1000)
    return () => clearInterval(interval)
  }, [clock])

  return elapsedMs
}
