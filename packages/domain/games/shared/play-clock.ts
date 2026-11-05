export interface PlayClock {
  /** Epoch ms when the current play segment started. */
  startedAt: number
  /** Accumulated elapsed ms from closed segments. */
  elapsedMs: number
}

/** `m:ss` under an hour, `h:mm:ss` once the round runs past 60 minutes. */
export function formatPlayElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

export function freshPlayClock(now = Date.now()): PlayClock {
  return { elapsedMs: 0, startedAt: now }
}

/**
 * Old saves omit the clock. Missing numbers become `0`, and a still-playing
 * round starts a new segment at `now` so closed-tab time is not counted.
 * A finished round keeps its accumulated `elapsedMs`.
 */
export function readStoredPlayClock(value: object, now: number): PlayClock {
  const record = value as { elapsedMs?: unknown; startedAt?: unknown; status?: unknown }
  const elapsedMs =
    typeof record.elapsedMs === "number" && Number.isFinite(record.elapsedMs)
      ? Math.max(0, record.elapsedMs)
      : 0

  if (record.status === "playing") {
    return { elapsedMs, startedAt: now }
  }

  const startedAt =
    typeof record.startedAt === "number" && Number.isFinite(record.startedAt)
      ? record.startedAt
      : now
  return { elapsedMs, startedAt }
}

/**
 * Flush the open segment on a playing mutation, or start a fresh segment
 * when a finished round returns to playing. Mirrors Sudoku's mutation clock.
 */
export function reconcilePlayClock<T extends PlayClock & { status: string }>(
  previous: T,
  next: T,
  now = Date.now(),
): T {
  if (next === previous) return previous

  if (previous.status === "playing") {
    return {
      ...next,
      elapsedMs: next.elapsedMs + (now - previous.startedAt),
      startedAt: now,
    }
  }

  if (next.status === "playing") {
    return { ...next, startedAt: now }
  }

  return next
}

/**
 * Fold the open playing segment into `elapsedMs` and close it at `now`.
 * Idle time already spent on the page is kept. A later hydrate starts a new
 * segment, so time away is not added. Finished rounds stay frozen.
 */
export function sealPlayClock<T extends PlayClock & { status: string }>(
  clock: T,
  now = Date.now(),
): T {
  if (clock.status !== "playing") return clock
  const delta = Math.max(0, now - clock.startedAt)
  if (delta === 0) return clock
  return {
    ...clock,
    elapsedMs: clock.elapsedMs + delta,
    startedAt: now,
  }
}

/** Live display value: base plus the open segment while playing. */
export function livePlayElapsedMs(
  clock: PlayClock,
  status: string,
  now = Date.now(),
): number {
  return status === "playing" ? clock.elapsedMs + (now - clock.startedAt) : clock.elapsedMs
}
