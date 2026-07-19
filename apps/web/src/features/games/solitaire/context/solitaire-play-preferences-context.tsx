"use client"

import * as React from "react"

import {
  DEFAULT_PLAYING_CARD_VARIANT,
  type PlayingCardVariant,
} from "@pasttime/domain/games"
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

  // Defaults match SSR (no localStorage). Hydrate from storage after mount so
  // the first client paint matches the server HTML.
  const [cardVariant, setCardVariantState] =
    React.useState<PlayingCardVariant>(DEFAULT_PLAYING_CARD_VARIANT)

  const [autoStackEnabled, setAutoStackEnabledState] = React.useState(false)

  React.useEffect(() => {
    setCardVariantState(readCardVariant(storage.get.bind(storage)))
    setAutoStackEnabledState(readAutoStackEnabled(storage.get.bind(storage)))
  }, [storage])

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
