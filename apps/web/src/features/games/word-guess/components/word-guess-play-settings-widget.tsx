"use client"

import * as React from "react"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { Switch } from "@/components/ui/switch"

interface WordGuessPlaySettingsWidgetProps {
  className?: string
  flipEnabled?: boolean
  onFlipToggle?: (enabled: boolean) => void
}

export function WordGuessPlaySettingsWidget({
  className,
  flipEnabled = false,
  onFlipToggle = () => {},
}: WordGuessPlaySettingsWidgetProps) {
  const [draftFlip, setDraftFlip] = React.useState(flipEnabled)
  const hasPendingChanges = draftFlip !== flipEnabled

  React.useEffect(() => {
    setDraftFlip(flipEnabled)
  }, [flipEnabled])

  const handleOpen = React.useCallback(() => {
    setDraftFlip(flipEnabled)
  }, [flipEnabled])

  const handleDismiss = React.useCallback(() => {
    setDraftFlip(flipEnabled)
  }, [flipEnabled])

  const handleApply = React.useCallback(() => {
    onFlipToggle(draftFlip)
  }, [draftFlip, onFlipToggle])

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
