"use client"

import { useLivePlayElapsed } from "@/features/games/hooks/use-live-play-elapsed"
import {
  formatPlayElapsed,
  type PlayClock,
} from "@pasttime/domain/games/shared/play-clock"

/** Play clock on the card title row. Ticks locally so the board does not re-render. */
export function PlayClockReadout({
  clock,
}: {
  clock: PlayClock & { status: string }
}) {
  const elapsedMs = useLivePlayElapsed(clock)

  return (
    <p
      className="shrink-0 font-mono text-base leading-none font-semibold tabular-nums tracking-tight text-foreground"
      aria-label="Elapsed time"
    >
      {formatPlayElapsed(elapsedMs)}
    </p>
  )
}
