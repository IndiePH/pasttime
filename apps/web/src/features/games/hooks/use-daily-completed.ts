"use client"

import { useEffect, useReducer } from "react"
import { getDailySeed } from "@pasttime/domain/daily"
import { useStorage } from "@/infrastructure/storage"

function getStatus(stored: unknown): string | null {
  if (!stored || typeof stored !== "object") return null
  const record = stored as Record<string, unknown>
  const status = record.status
  return typeof status === "string" ? status : null
}

export function useDailyCompleted(
  gameId: string,
  variant: string,
): boolean {
  const storage = useStorage()
  const [, refresh] = useReducer((c) => c + 1, 0)

  const key = `${gameId}:daily:${variant}:${getDailySeed(new Date())}`

  // Refresh on focus/visibility changes (player may complete daily in another tab)
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("focus", handler)
    document.addEventListener("visibilitychange", handler)
    return () => {
      window.removeEventListener("focus", handler)
      document.removeEventListener("visibilitychange", handler)
    }
  }, [])

  const status = getStatus(storage.get(key))
  return status === "won" || status === "lost"
}
