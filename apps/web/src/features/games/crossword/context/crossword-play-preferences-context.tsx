"use client"

import * as React from "react"

import {
  CROSSWORD_PLAY_PREFERENCES_DEFAULT,
  readCrosswordPlayPreferences,
  writeCrosswordPlayPreferences,
  type CrosswordPlayPreferences,
} from "@pasttime/domain/games/crossword"
import { useStorage } from "@/infrastructure/storage"

export interface CrosswordPlayPreferencesContextValue {
  showErrors: boolean
  setShowErrors: (value: boolean) => void
  autoCheck: boolean
  setAutoCheck: (value: boolean) => void
  showWordSpanHighlight: boolean
  setShowWordSpanHighlight: (value: boolean) => void
  showCornerArrowGlyph: boolean
  setShowCornerArrowGlyph: (value: boolean) => void
  showDirectionBorderColor: boolean
  setShowDirectionBorderColor: (value: boolean) => void
  blinkActiveClue: boolean
  setBlinkActiveClue: (value: boolean) => void
}

const CrosswordPlayPreferencesContext =
  React.createContext<CrosswordPlayPreferencesContextValue | null>(null)

interface CrosswordPlayPreferencesProviderProps {
  children: React.ReactNode
}

export function CrosswordPlayPreferencesProvider({
  children,
}: CrosswordPlayPreferencesProviderProps) {
  const storage = useStorage()

  const [prefs, setPrefs] = React.useState<CrosswordPlayPreferences>(() =>
    readCrosswordPlayPreferences(storage.get.bind(storage)),
  )

  const setShowErrors = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, showErrors: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const setAutoCheck = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, autoCheck: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const setShowWordSpanHighlight = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, showWordSpanHighlight: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const setShowCornerArrowGlyph = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, showCornerArrowGlyph: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const setShowDirectionBorderColor = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, showDirectionBorderColor: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const setBlinkActiveClue = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, blinkActiveClue: value }
        writeCrosswordPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const value = React.useMemo(
    () => ({
      showErrors: prefs.showErrors,
      setShowErrors,
      autoCheck: prefs.autoCheck,
      setAutoCheck,
      showWordSpanHighlight: prefs.showWordSpanHighlight,
      setShowWordSpanHighlight,
      showCornerArrowGlyph: prefs.showCornerArrowGlyph,
      setShowCornerArrowGlyph,
      showDirectionBorderColor: prefs.showDirectionBorderColor,
      setShowDirectionBorderColor,
      blinkActiveClue: prefs.blinkActiveClue,
      setBlinkActiveClue,
    }),
    [
      prefs.showErrors,
      prefs.autoCheck,
      setShowErrors,
      setAutoCheck,
      prefs.showWordSpanHighlight,
      prefs.showCornerArrowGlyph,
      prefs.showDirectionBorderColor,
      prefs.blinkActiveClue,
      setShowWordSpanHighlight,
      setShowCornerArrowGlyph,
      setShowDirectionBorderColor,
      setBlinkActiveClue,
    ],
  )

  return (
    <CrosswordPlayPreferencesContext.Provider value={value}>
      {children}
    </CrosswordPlayPreferencesContext.Provider>
  )
}

export function useCrosswordPlayPreferences(): CrosswordPlayPreferencesContextValue {
  const ctx = React.useContext(CrosswordPlayPreferencesContext)
  if (!ctx) {
    throw new Error(
      "useCrosswordPlayPreferences must be used inside CrosswordPlayPreferencesProvider",
    )
  }
  return ctx
}

export const CROSSWORD_PLAY_PREFERENCES_DEFAULT_VALUE =
  CROSSWORD_PLAY_PREFERENCES_DEFAULT
