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
  const [, refresh] = React.useReducer((count) => count + 1, 0)

  React.useEffect(() => {
    function handleRefresh() {
      refresh()
    }

    window.addEventListener("focus", handleRefresh)
    document.addEventListener("visibilitychange", handleRefresh)
    return () => {
      window.removeEventListener("focus", handleRefresh)
      document.removeEventListener("visibilitychange", handleRefresh)
    }
  }, [])

  return isWordGuessDailyCompleted(storage.get(storageKey), wordLength)
}
