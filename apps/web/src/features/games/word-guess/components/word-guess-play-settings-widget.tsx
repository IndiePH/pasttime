"use client"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"

interface WordGuessPlaySettingsWidgetProps {
  className?: string
}

export function WordGuessPlaySettingsWidget({
  className,
}: WordGuessPlaySettingsWidgetProps) {
  return (
    <GameSettingsWidget
      className={className}
      panelId="word-guess-play-settings-panel"
      description="Adjustments during this round."
    >
      <p className="text-sm text-muted-foreground">
        Word length and mode are set from the launch screen. Return there to
        change them.
      </p>
    </GameSettingsWidget>
  )
}
