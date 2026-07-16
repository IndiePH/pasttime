"use client"

import { useMemo, useSyncExternalStore } from "react"

import {
  getWordGuessSoloStorageKey,
  isWordGuessDailyCompleted,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess/persistence"
import { useStorage } from "@/infrastructure/storage"

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

export function useWordGuessDailyCompleted(
  wordLength: WordGuessLength,
): boolean {
  const storage = useStorage()
  const storageKey = useMemo(
    () => getWordGuessSoloStorageKey(wordLength, "daily"),
    [wordLength],
  )

  // Default to false during SSR/first render to avoid hydration mismatch;
  // useSyncExternalStore's getServerSnapshot keeps the server and the first
  // client render in sync, then re-reads from storage after hydration.
  const completed = useSyncExternalStore(
    subscribe,
    () => isWordGuessDailyCompleted(storage.get(storageKey), wordLength),
    () => false,
  )

  return completed
}