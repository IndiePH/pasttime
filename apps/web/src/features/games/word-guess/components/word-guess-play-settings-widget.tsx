"use client"

import * as React from "react"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { Switch } from "@/components/ui/switch"
import { useWordGuessPlayPreferences } from "@/features/games/word-guess/context/word-guess-play-preferences-context"

interface WordGuessPlaySettingsWidgetProps {
  className?: string
}

export function WordGuessPlaySettingsWidget({
  className,
}: WordGuessPlaySettingsWidgetProps) {
  const { flipEnabled, setFlipEnabled } = useWordGuessPlayPreferences()

  const [draftFlip, setDraftFlip] = React.useState(flipEnabled)
  // Sync draft to actual whenever flipEnabled changes (e.g. undo via dismiss).
  // Uses the React "adjust state during render" pattern (recognised by the
  // compiler) instead of setState-in-effect.
  const [prevFlipEnabled, setPrevFlipEnabled] = React.useState(flipEnabled)
  if (flipEnabled !== prevFlipEnabled) {
    setPrevFlipEnabled(flipEnabled)
    setDraftFlip(flipEnabled)
  }
  const hasPendingChanges = draftFlip !== flipEnabled

  const handleOpen = React.useCallback(() => {
    setDraftFlip(flipEnabled)
  }, [flipEnabled])

  const handleDismiss = React.useCallback(() => {
    setDraftFlip(flipEnabled)
  }, [flipEnabled])

  const handleApply = React.useCallback(() => {
    setFlipEnabled(draftFlip)
  }, [draftFlip, setFlipEnabled])

  return (
    <GameSettingsWidget
      className={className}
      panelId="word-guess-play-settings-panel"
      description="Adjustments during this round."
      summary={flipEnabled ? "Flip animation on" : "Flip animation off"}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            Flip-to-reveal animation
          </p>
          <p className="text-xs text-muted-foreground">
            Tiles flip with a 3D animation when you submit a guess.
          </p>
        </div>
        <Switch
          checked={draftFlip}
          onCheckedChange={setDraftFlip}
        />
      </div>
    </GameSettingsWidget>
  )
}
