"use client"

import * as React from "react"

import {
  getWordGuessSoloStorageKey,
  isWordGuessDailyCompleted,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess/persistence"
import { useStorage } from "@/infrastructure/storage"

export function useWordGuessDailyCompleted(
  wordLength: WordGuessLength,
): boolean {
  const storage = useStorage()
  const storageKey = React.useMemo(
    () => getWordGuessSoloStorageKey(wordLength, "daily"),
    [wordLength],
  )

  // Default to false during SSR/first render to avoid hydration mismatch.
  // localStorage is not available during SSR.
  const [completed, setCompleted] = React.useState(false)

  React.useEffect(() => {
    const stored = storage.get(storageKey)
    setCompleted(isWordGuessDailyCompleted(stored, wordLength))

    function handleRefresh() {
      const s = storage.get(storageKey)
      setCompleted(isWordGuessDailyCompleted(s, wordLength))
    }

    window.addEventListener("focus", handleRefresh)
    document.addEventListener("visibilitychange", handleRefresh)
    return () => {
      window.removeEventListener("focus", handleRefresh)
      document.removeEventListener("visibilitychange", handleRefresh)
    }
  }, [storageKey, wordLength, storage])

  return completed
}
