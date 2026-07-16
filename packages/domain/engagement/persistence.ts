import type { StorageAdapter } from "@pasttime/storage/types"
import type { DailyCompletion } from "./types"

// --- Helpers ---

/**
 * Returns a date as "YYYY-MM-DD" in UTC.
 * Standalone helper — does not depend on @pasttime/domain/daily.
 */
export function getDateString(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Returns the storage key for a game's daily completions.
 * Format: `<gameId>:daily:completions`
 */
export function getEngagementStorageKey(gameId: string): string {
  return `${gameId}:daily:completions`
}

/**
 * Loads daily completions for a given game from storage.
 * Returns an empty array if no data exists or data is malformed.
 */
export function loadCompletions(
  storage: StorageAdapter,
  gameId: string,
): DailyCompletion[] {
  const key = getEngagementStorageKey(gameId)
  try {
    const data = storage.get<DailyCompletion[]>(key)
    if (!Array.isArray(data)) return []
    return data
  } catch {
    return []
  }
}

/**
 * Saves daily completions for a given game to storage.
 */
export function saveCompletions(
  storage: StorageAdapter,
  gameId: string,
  completions: DailyCompletion[],
): void {
  const key = getEngagementStorageKey(gameId)
  storage.set(key, completions)
}

/**
 * Adds a completion to an existing completions array, deduplicating by date.
 *
 * If a completion for the same `date` (YYYY-MM-DD) already exists, it is
 * replaced with the new one. Otherwise the new completion is appended.
 *
 * Returns a new array (immutable — the original is not mutated).
 */
export function addCompletion(
  completions: DailyCompletion[],
  newCompletion: DailyCompletion,
): DailyCompletion[] {
  const idx = completions.findIndex(
    (c) => c.date === newCompletion.date,
  )

  if (idx >= 0) {
    // Replace existing entry for the same date
    return [
      ...completions.slice(0, idx),
      newCompletion,
      ...completions.slice(idx + 1),
    ]
  }

  // Append new entry
  return [...completions, newCompletion]
}
