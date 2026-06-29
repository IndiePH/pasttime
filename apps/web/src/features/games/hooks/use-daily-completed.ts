"use client"

import { useEffect, useState } from "react"
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

  const key = `${gameId}:daily:${variant}:${getDailySeed(new Date())}`

  // Default to false during SSR/first render to avoid hydration mismatch.
  // localStorage is not available during SSR, and reading it synchronously
  // on the client would produce a different result than the server render.
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const status = getStatus(storage.get(key))
    setCompleted(status === "won" || status === "lost")

    // Refresh on focus/visibility changes (player may complete daily in another tab)
    const refresh = () => {
      const s = getStatus(storage.get(key))
      setCompleted(s === "won" || s === "lost")
    }
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [key, storage])

  return completed
}
