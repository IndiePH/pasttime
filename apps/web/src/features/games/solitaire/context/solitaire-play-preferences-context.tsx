"use client"

import * as React from "react"

import type { PlayingCardVariant } from "@pasttime/domain/games"
import {
  readCardVariant,
  writeCardVariant,
} from "@/features/games/cards/card-game-preferences"
import {
  readAutoStackEnabled,
  writeAutoStackEnabled,
} from "@/features/games/solitaire/solitaire-play-preferences"
import { useStorage } from "@/infrastructure/storage"

export interface SolitairePlayPreferences {
  cardVariant: PlayingCardVariant
  setCardVariant: (variant: PlayingCardVariant) => void
  autoStackEnabled: boolean
  setAutoStackEnabled: (enabled: boolean) => void
}

const SolitairePlayPreferencesContext =
  React.createContext<SolitairePlayPreferences | null>(null)

interface SolitairePlayPreferencesProviderProps {
  children: React.ReactNode
}

export function SolitairePlayPreferencesProvider({
  children,
}: SolitairePlayPreferencesProviderProps) {
  const storage = useStorage()

  const [cardVariant, setCardVariantState] =
    React.useState<PlayingCardVariant>(() =>
      readCardVariant(storage.get.bind(storage)),
    )

  const [autoStackEnabled, setAutoStackEnabledState] = React.useState(() =>
    readAutoStackEnabled(storage.get.bind(storage)),
  )

  const setCardVariant = React.useCallback(
    (variant: PlayingCardVariant) => {
      setCardVariantState(variant)
      writeCardVariant(storage.set.bind(storage), variant)
    },
    [storage],
  )

  const setAutoStackEnabled = React.useCallback(
    (enabled: boolean) => {
      setAutoStackEnabledState(enabled)
      writeAutoStackEnabled(storage.set.bind(storage), enabled)
    },
    [storage],
  )

  const value = React.useMemo(
    () => ({
      cardVariant,
      setCardVariant,
      autoStackEnabled,
      setAutoStackEnabled,
    }),
    [autoStackEnabled, cardVariant, setAutoStackEnabled, setCardVariant],
  )

  return (
    <SolitairePlayPreferencesContext.Provider value={value}>
      {children}
    </SolitairePlayPreferencesContext.Provider>
  )
}

export function useSolitairePlayPreferencesContext(): SolitairePlayPreferences {
  const ctx = React.useContext(SolitairePlayPreferencesContext)
  if (!ctx) {
    throw new Error(
      "useSolitairePlayPreferencesContext must be used inside SolitairePlayPreferencesProvider",
    )
  }
  return ctx
}
