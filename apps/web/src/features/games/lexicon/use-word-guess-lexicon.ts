"use client"

import * as React from "react"

import type { WordDefinition } from "@pasttime/domain/games/shared/lexicon-types"
import { loadWordDefinition, loadWordGuessLexicon } from "@/lib/lexicon/client"

type LexiconStatus = "idle" | "loading" | "ready" | "error"

export function useWordGuessLexicon(length: number) {
  const [status, setStatus] = React.useState<LexiconStatus>("idle")
  const [answerWords, setAnswerWords] = React.useState<readonly string[]>([])
  const [guessableSet, setGuessableSet] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [error, setError] = React.useState<string | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    setStatus("loading")
    setError(null)

    void loadWordGuessLexicon(length)
      .then((lexicon) => {
        if (cancelled) return
        setAnswerWords(lexicon.answerWords)
        setGuessableSet(lexicon.guessableSet)
        setStatus("ready")
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setStatus("error")
        setError(cause instanceof Error ? cause.message : "Failed to load dictionary")
      })

    return () => {
      cancelled = true
    }
  }, [length, retryCount])

  const retry = React.useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return {
    status,
    answerWords,
    guessableSet,
    error,
    retry,
    isReady: status === "ready",
  }
}

export function useWordDefinition(word: string | null, enabled: boolean) {
  const [definition, setDefinition] = React.useState<WordDefinition | null>(null)

  React.useEffect(() => {
    if (!enabled || !word) {
      setDefinition(null)
      return
    }

    let cancelled = false
    void loadWordDefinition(word)
      .then((entry) => {
        if (!cancelled) {
          setDefinition(entry)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDefinition(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [enabled, word])

  return definition
}
