"use client"

import * as React from "react"

import {
  readSudokuPlayPreferences,
  writeSudokuPlayPreferences,
  type SudokuPlayPreferences,
} from "@pasttime/domain/games/sudoku"
import { useStorage } from "@/infrastructure/storage"

export interface SudokuPlayPreferencesContextValue {
  autoCandidates: boolean
  setAutoCandidates: (value: boolean) => void
}

const SudokuPlayPreferencesContext =
  React.createContext<SudokuPlayPreferencesContextValue | null>(null)

interface SudokuPlayPreferencesProviderProps {
  children: React.ReactNode
}

export function SudokuPlayPreferencesProvider({
  children,
}: SudokuPlayPreferencesProviderProps) {
  const storage = useStorage()

  const [prefs, setPrefs] = React.useState<SudokuPlayPreferences>(() =>
    readSudokuPlayPreferences(storage.get.bind(storage)),
  )

  const setAutoCandidates = React.useCallback(
    (value: boolean) => {
      setPrefs((prev) => {
        const next = { ...prev, autoCandidates: value }
        writeSudokuPlayPreferences(storage.set.bind(storage), next)
        return next
      })
    },
    [storage],
  )

  const value = React.useMemo(
    () => ({
      autoCandidates: prefs.autoCandidates,
      setAutoCandidates,
    }),
    [prefs.autoCandidates, setAutoCandidates],
  )

  return (
    <SudokuPlayPreferencesContext.Provider value={value}>
      {children}
    </SudokuPlayPreferencesContext.Provider>
  )
}

export function useSudokuPlayPreferences(): SudokuPlayPreferencesContextValue {
  const ctx = React.useContext(SudokuPlayPreferencesContext)
  if (!ctx) {
    throw new Error(
      "useSudokuPlayPreferences must be used inside SudokuPlayPreferencesProvider",
    )
  }
  return ctx
}
