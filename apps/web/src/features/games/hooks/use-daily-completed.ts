"use client"

import { useSyncExternalStore } from "react"
import { getDailySeed } from "@pasttime/domain/daily"
import { useStorage } from "@/infrastructure/storage"

function getStatus(stored: unknown): string | null {
  if (!stored || typeof stored !== "object") return null
  const record = stored as Record<string, unknown>
  const status = record.status
  return typeof status === "string" ? status : null
}

/**
 * Subscribe to store-change signals. The daily completion value is derived
 * from localStorage, so we re-read whenever the tab regains focus or becomes
 * visible (player may complete the daily in another tab).
 */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("focus", onStoreChange)
  document.addEventListener("visibilitychange", onStoreChange)
  return () => {
    window.removeEventListener("focus", onStoreChange)
    document.removeEventListener("visibilitychange", onStoreChange)
  }
}

export function useDailyCompleted(
  gameId: string,
  variant: string,
): boolean {
  const storage = useStorage()

  const key = `${gameId}:daily:${variant}:${getDailySeed(new Date())}`

  // Default to false during SSR/first render to avoid hydration mismatch;
  // useSyncExternalStore's getServerSnapshot keeps the server and the first
  // client render in sync, then re-reads from storage after hydration.
  const completed = useSyncExternalStore(
    subscribe,
    () => {
      const status = getStatus(storage.get(key))
      return status === "won" || status === "lost"
    },
    () => false,
  )

  return completed
}