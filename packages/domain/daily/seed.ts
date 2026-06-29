/** Deterministic daily seed from a calendar date (UTC). */
export function getDailySeed(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  return y * 10_000 + m * 100 + d
}

/** Avalanche hash for mixing an integer seed. */
export function hashSeed(seed: number): number {
  let value = seed | 0
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value ^= value >>> 16
  return value >>> 0
}

/**
 * Returns true when the daily puzzle seed has changed between `lastDate` and `now`.
 * Uses getDailySeed internally, so comparison is at UTC-day granularity.
 */
export function isNewDay(
  lastDate: Date | number,
  now: Date | number,
): boolean {
  const last = typeof lastDate === "number" ? new Date(lastDate) : lastDate
  const current = typeof now === "number" ? new Date(now) : now
  return getDailySeed(last) !== getDailySeed(current)
}
