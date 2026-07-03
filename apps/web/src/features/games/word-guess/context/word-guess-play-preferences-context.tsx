"use client"

import * as React from "react"

export interface WordGuessPlayPreferencesContextValue {
  flipEnabled: boolean
  setFlipEnabled: (value: boolean) => void
}

const WordGuessPlayPreferencesContext =
  React.createContext<WordGuessPlayPreferencesContextValue | null>(null)

interface WordGuessPlayPreferencesProviderProps {
  children: React.ReactNode
}

export function WordGuessPlayPreferencesProvider({
  children,
}: WordGuessPlayPreferencesProviderProps) {
  const [flipEnabled, setFlipEnabled] = React.useState(false)

  const value = React.useMemo(
    () => ({ flipEnabled, setFlipEnabled }),
    [flipEnabled, setFlipEnabled],
  )

  return (
    <WordGuessPlayPreferencesContext.Provider value={value}>
      {children}
    </WordGuessPlayPreferencesContext.Provider>
  )
}

export function useWordGuessPlayPreferences(): WordGuessPlayPreferencesContextValue {
  const ctx = React.useContext(WordGuessPlayPreferencesContext)
  if (!ctx) {
    throw new Error(
      "useWordGuessPlayPreferences must be used inside WordGuessPlayPreferencesProvider",
    )
  }
  return ctx
}
