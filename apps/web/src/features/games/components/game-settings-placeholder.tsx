"use client"

import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"

interface GameSettingsPlaceholderProps {
  gameId: string
  className?: string
}

export function GameSettingsPlaceholder({
  gameId,
  className,
}: GameSettingsPlaceholderProps) {
  return (
    <GameSettingsWidget
      className={className}
      panelId={`${gameId}-settings-panel`}
      description="Customize how you play."
    >
      <p className="text-sm text-muted-foreground">
        No settings for this game yet.
      </p>
    </GameSettingsWidget>
  )
}
