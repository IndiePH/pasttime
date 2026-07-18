"use client"

import * as React from "react"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SettingsToggleField } from "@/features/games/components/settings-toggle-field"
import { useSudokuPlayPreferences } from "@/features/games/sudoku/context/sudoku-play-preferences-context"

interface SudokuPlaySettingsWidgetProps {
  className?: string
}

export function SudokuPlaySettingsWidget({
  className,
}: SudokuPlaySettingsWidgetProps) {
  const { autoCandidates, setAutoCandidates } = useSudokuPlayPreferences()

  const [draftAutoCandidates, setDraftAutoCandidates] =
    React.useState(autoCandidates)
  // Sync draft to actual whenever autoCandidates changes elsewhere (e.g. undo
  // via dismiss). Uses the React "adjust state during render" pattern
  // (recognised by the compiler) instead of setState-in-effect.
  const [prevAutoCandidates, setPrevAutoCandidates] =
    React.useState(autoCandidates)
  if (autoCandidates !== prevAutoCandidates) {
    setPrevAutoCandidates(autoCandidates)
    setDraftAutoCandidates(autoCandidates)
  }
  const hasPendingChanges = draftAutoCandidates !== autoCandidates

  const handleOpen = React.useCallback(() => {
    setDraftAutoCandidates(autoCandidates)
  }, [autoCandidates])

  const handleDismiss = React.useCallback(() => {
    setDraftAutoCandidates(autoCandidates)
  }, [autoCandidates])

  const handleApply = React.useCallback(() => {
    setAutoCandidates(draftAutoCandidates)
  }, [draftAutoCandidates, setAutoCandidates])

  return (
    <GameSettingsWidget
      className={className}
      panelId="sudoku-play-settings-panel"
      description="Adjustments during this round."
      summary={autoCandidates ? "Auto-candidates on" : "Auto-candidates off"}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <SettingsToggleField
        label="Auto-candidates"
        description="Automatically fill in each cell's remaining possibilities as you play."
        value={draftAutoCandidates}
        onValueChange={setDraftAutoCandidates}
      />
    </GameSettingsWidget>
  )
}
