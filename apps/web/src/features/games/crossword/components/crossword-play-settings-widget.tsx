"use client"

import * as React from "react"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SettingsToggleField } from "@/features/games/components/settings-toggle-field"
import { useCrosswordPlayPreferences } from "@/features/games/crossword/context/crossword-play-preferences-context"

interface CrosswordPlaySettingsWidgetProps {
  className?: string
}

export function CrosswordPlaySettingsWidget({
  className,
}: CrosswordPlaySettingsWidgetProps) {
  const {
    showErrors,
    setShowErrors,
    autoCheck,
    setAutoCheck,
  } = useCrosswordPlayPreferences()
  const [draftShowErrors, setDraftShowErrors] = React.useState(showErrors)
  const [draftAutoCheck, setDraftAutoCheck] = React.useState(autoCheck)
  const hasPendingChanges =
    draftShowErrors !== showErrors || draftAutoCheck !== autoCheck

  const handleOpen = React.useCallback(() => {
    setDraftShowErrors(showErrors)
    setDraftAutoCheck(autoCheck)
  }, [autoCheck, showErrors])

  const handleDismiss = React.useCallback(() => {
    setDraftShowErrors(showErrors)
    setDraftAutoCheck(autoCheck)
  }, [autoCheck, showErrors])

  const handleApply = React.useCallback(() => {
    setShowErrors(draftShowErrors)
    setAutoCheck(draftAutoCheck)
  }, [draftAutoCheck, draftShowErrors, setAutoCheck, setShowErrors])

  const summary = [
    `Errors ${showErrors ? "on" : "off"}`,
    `Auto-check ${autoCheck ? "on" : "off"}`,
  ].join(" · ")

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,22rem)]"
      panelId="crossword-play-settings-panel"
      description="Feedback and checking during this puzzle."
      summary={summary}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <div className="space-y-5">
        <SettingsToggleField
          label="Show errors"
          description="Highlight cells whose letter doesn't match the answer."
          value={draftShowErrors}
          onValueChange={setDraftShowErrors}
        />
        <SettingsToggleField
          label="Auto-check"
          description="Mark the puzzle solved the moment every letter is correct."
          value={draftAutoCheck}
          onValueChange={setDraftAutoCheck}
        />
      </div>
    </GameSettingsWidget>
  )
}
