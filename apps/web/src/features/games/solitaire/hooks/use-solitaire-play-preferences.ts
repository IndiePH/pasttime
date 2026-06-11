"use client"

import * as React from "react"

import {
  readAutoStackEnabled,
  writeAutoStackEnabled,
} from "@/features/games/solitaire/solitaire-play-preferences"
import { useStorage } from "@/infrastructure/storage"

export function useSolitairePlayPreferences() {
  const storage = useStorage()
  const [autoStackEnabled, setAutoStackEnabledState] = React.useState(() =>
    readAutoStackEnabled(storage.get.bind(storage)),
  )

  const setAutoStackEnabled = React.useCallback(
    (enabled: boolean) => {
      setAutoStackEnabledState(enabled)
      writeAutoStackEnabled(storage.set.bind(storage), enabled)
    },
    [storage],
  )

  React.useEffect(() => {
    writeAutoStackEnabled(storage.set.bind(storage), autoStackEnabled)
  }, [autoStackEnabled, storage])

  return { autoStackEnabled, setAutoStackEnabled }
}
