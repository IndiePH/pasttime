import { getDailySeed } from "../daily"
import type { DailyCompletion, StreakRecord } from "./types"

/**
 * Check if two date strings (YYYY-MM-DD) represent consecutive calendar days in UTC.
 *
 * Uses {@link getDailySeed} for day-boundary comparison (ENG-05): adds 1 day to `a`
 * and compares the resulting daily seed against `b`'s seed.
 *
 * @param a - Earlier date string (YYYY-MM-DD, UTC)
 * @param b - Later date string (YYYY-MM-DD, UTC)
 * @returns true if `b` is exactly the day after `a`
 */
function areConsecutiveDays(a: string, b: string): boolean {
  const dateA = new Date(a + "T00:00:00Z")
  const nextA = new Date(dateA)
  nextA.setUTCDate(nextA.getUTCDate() + 1)
  const dateB = new Date(b + "T00:00:00Z")
  return getDailySeed(nextA) === getDailySeed(dateB)
}

/**
 * Format a Date as "YYYY-MM-DD" in UTC.
 */
function fmtDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Compute current and longest streak from daily completion records.
 *
 * **Algorithm:**
 * 1. Deduplicate by date (the last completion for a given date wins).
 * 2. Sort unique dates ascending.
 * 3. **Current streak:** starts at the most recent completion if it is today or
 *    yesterday (UTC); then walks backwards counting consecutive days until a gap
 *    is found.
 * 4. **Longest streak:** scans the entire sorted list for the longest run of
 *    consecutive calendar dates.
 *
 * **Edge cases:**
 * - Empty array → `{ current: 0, longest: 0 }`
 * - Single completion today → `{ current: 1, longest: 1 }`
 * - Single completion yesterday → `{ current: 1, longest: 1 }`
 * - Single completion older than yesterday → `{ current: 0, longest: 1 }`
 * - Gap in the middle → current resets at the gap, longest tracks the
 *   best consecutive run in the full history
 *
 * @param completions - Array of DailyCompletion records (caller may pass unsorted
 *   or with duplicate dates — the function normalises both)
 * @returns The computed current and longest streak counts
 */
export function computeStreak(completions: DailyCompletion[]): StreakRecord {
  if (completions.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Step 1: Deduplicate by date (last entry wins for each date)
  const byDate = new Map<string, DailyCompletion>()
  for (const c of completions) {
    byDate.set(c.date, c)
  }

  // Step 2: Sort unique dates ascending
  const uniqueDates = Array.from(byDate.keys()).sort()
  const n = uniqueDates.length

  // Step 3: Compute longest streak — scan for the longest consecutive run
  let longest = 0
  let runStart = 0
  for (let i = 1; i <= n; i++) {
    if (i < n && areConsecutiveDays(uniqueDates[i - 1], uniqueDates[i])) {
      continue
    }
    const runLength = i - runStart
    if (runLength > longest) {
      longest = runLength
    }
    runStart = i
  }

  // Step 4: Compute current streak
  const now = new Date()
  const todayStr = fmtDate(now)
  const yesterdayStr = fmtDate(new Date(now.getTime() - 86_400_000))
  const mostRecent = uniqueDates[n - 1]
  let current = 0

  if (mostRecent === todayStr || mostRecent === yesterdayStr) {
    current = 1
    for (let i = n - 2; i >= 0; i--) {
      if (areConsecutiveDays(uniqueDates[i], uniqueDates[i + 1])) {
        current++
      } else {
        break
      }
    }
  }

  return { current, longest }
}
