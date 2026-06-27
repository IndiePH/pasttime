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

  const value = React.useMemo(
    () => ({
      showErrors: prefs.showErrors,
      setShowErrors,
      autoCheck: prefs.autoCheck,
      setAutoCheck,
    }),
    [prefs.showErrors, prefs.autoCheck, setShowErrors, setAutoCheck],
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
