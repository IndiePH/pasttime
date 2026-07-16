"use client"

import * as React from "react"

import type { WordDefinition } from "@pasttime/domain/games/shared/lexicon-types"
import { loadWordDefinition, loadWordGuessLexicon } from "@/lib/lexicon/client"

type LexiconStatus = "loading" | "ready" | "error"

export function useWordGuessLexicon(length: number) {
  const [answerWords, setAnswerWords] = React.useState<readonly string[]>([])
  const [guessableSet, setGuessableSet] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [loadedLength, setLoadedLength] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false

    void loadWordGuessLexicon(length)
      .then((lexicon) => {
        if (cancelled) return
        setAnswerWords(lexicon.answerWords)
        setGuessableSet(lexicon.guessableSet)
        setLoadedLength(length)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setLoadedLength(null)
        setError(cause instanceof Error ? cause.message : "Failed to load dictionary")
      })

    return () => {
      cancelled = true
    }
  }, [length, retryCount])

  const retry = React.useCallback(() => {
    setLoadedLength(null)
    setError(null)
    setRetryCount((count) => count + 1)
  }, [])

  const isStale = loadedLength !== length
  const status: LexiconStatus = error
    ? "error"
    : isStale || loadedLength === null
      ? "loading"
      : "ready"

  return {
    status,
    answerWords: isStale ? [] : answerWords,
    guessableSet: isStale ? new Set<string>() : guessableSet,
    error,
    retry,
    isReady: status === "ready",
  }
}

export function useWordDefinition(word: string | null, enabled: boolean) {
  const [definition, setDefinition] = React.useState<WordDefinition | null>(null)
  const [loadedWord, setLoadedWord] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!enabled || !word) {
      return
    }

    let cancelled = false
    void loadWordDefinition(word)
      .then((entry) => {
        if (!cancelled) {
          setDefinition(entry)
          setLoadedWord(word)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDefinition(null)
          setLoadedWord(word)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, word])

  if (!enabled || !word || loadedWord !== word) {
    return null
  }

  return definition
}
