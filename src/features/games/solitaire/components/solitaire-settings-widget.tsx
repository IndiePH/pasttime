"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatSolitaireModeLabel,
  parseSolitaireMode,
  SOLITAIRE_MODE_DEFAULT,
  type SolitaireMode,
} from "@/domain/games/solitaire"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SolitaireModePicker } from "@/features/games/solitaire/components/solitaire-mode-picker"
import { solitaireSearchParams } from "@/features/games/solitaire/search-params"

interface SolitaireSettingsWidgetProps {
  className?: string
}

export function SolitaireSettingsWidget({
  className,
}: SolitaireSettingsWidgetProps) {
  const [draftMode, setDraftMode] =
    React.useState<SolitaireMode>(SOLITAIRE_MODE_DEFAULT)
  const [modeParam, setModeParam] = useQueryState(
    "mode",
    solitaireSearchParams.mode,
  )
  const appliedMode = parseSolitaireMode(modeParam)
  const hasPendingChanges = draftMode !== appliedMode

  const handleOpen = React.useCallback(() => {
    setDraftMode(appliedMode)
  }, [appliedMode])

  const handleApply = React.useCallback(() => {
    void setModeParam(draftMode)
  }, [draftMode, setModeParam])

  const handleDismiss = React.useCallback(() => {
    setDraftMode(appliedMode)
  }, [appliedMode])

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,22rem)]"
      panelId="solitaire-settings-panel"
      description="Solitaire layout for this session."
      summary={formatSolitaireModeLabel(appliedMode)}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <SolitaireModePicker
        compact
        value={draftMode}
        onValueChange={setDraftMode}
      />
    </GameSettingsWidget>
  )
}
