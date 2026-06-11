"use client"

import * as React from "react"

import type { PlayingCardVariant } from "@pasttime/domain/games"
import {
  readCardVariant,
  writeCardVariant,
} from "@/features/games/cards/card-game-preferences"
import { useStorage } from "@/infrastructure/storage"

export function useCardGamePreferences() {
  const storage = useStorage()
  const [variant, setVariantState] = React.useState<PlayingCardVariant>(() =>
    readCardVariant(storage.get.bind(storage)),
  )

  const setVariant = React.useCallback(
    (next: PlayingCardVariant) => {
      setVariantState(next)
      writeCardVariant(storage.set.bind(storage), next)
    },
    [storage],
  )

  React.useEffect(() => {
    writeCardVariant(storage.set.bind(storage), variant)
  }, [storage, variant])

  return { variant, setVariant }
}
