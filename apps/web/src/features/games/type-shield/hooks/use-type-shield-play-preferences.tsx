"use client"

import * as React from "react"

import type {
  TypeShieldDifficulty,
  TypeShieldMode,
} from "@pasttime/domain/games/type-shield"
import { useStorage } from "@/infrastructure/storage"
import {
  readCometEffects,
  readDifficulty,
  readMode,
  writeCometEffects,
  writeDifficulty,
  writeMode,
} from "@/features/games/type-shield/type-shield-play-preferences"

interface TypeShieldPlayPreferencesContextValue {
  cometEffects: boolean
  setCometEffects: (enabled: boolean) => void
  difficulty: TypeShieldDifficulty
  setDifficulty: (difficulty: TypeShieldDifficulty) => void
  mode: TypeShieldMode
  setMode: (mode: TypeShieldMode) => void
}

const TypeShieldPlayPreferencesContext =
  React.createContext<TypeShieldPlayPreferencesContextValue | null>(null)

export function TypeShieldPlayPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storage = useStorage()
  const [cometEffects, setCometEffectsState] = React.useState(() =>
    readCometEffects(storage.get.bind(storage)),
  )
  const [difficulty, setDifficultyState] = React.useState<TypeShieldDifficulty>(
    () => readDifficulty(storage.get.bind(storage)),
  )
  const [mode, setModeState] = React.useState<TypeShieldMode>(() =>
    readMode(storage.get.bind(storage)),
  )

  const setCometEffects = React.useCallback(
    (enabled: boolean) => {
      setCometEffectsState(enabled)
      writeCometEffects(storage.set.bind(storage), enabled)
    },
    [storage],
  )

  const setDifficulty = React.useCallback(
    (next: TypeShieldDifficulty) => {
      setDifficultyState(next)
      writeDifficulty(storage.set.bind(storage), next)
    },
    [storage],
  )

  const setMode = React.useCallback(
    (next: TypeShieldMode) => {
      setModeState(next)
      writeMode(storage.set.bind(storage), next)
    },
    [storage],
  )

  const value = React.useMemo(
    () => ({
      cometEffects,
      setCometEffects,
      difficulty,
      setDifficulty,
      mode,
      setMode,
    }),
    [cometEffects, difficulty, mode, setCometEffects, setDifficulty, setMode],
  )

  return (
    <TypeShieldPlayPreferencesContext.Provider value={value}>
      {children}
    </TypeShieldPlayPreferencesContext.Provider>
  )
}

export function useTypeShieldPlayPreferences(): TypeShieldPlayPreferencesContextValue {
  const value = React.useContext(TypeShieldPlayPreferencesContext)
  if (!value) {
    throw new Error(
      "useTypeShieldPlayPreferences must be used inside TypeShieldPlayPreferencesProvider",
    )
  }
  return value
}
