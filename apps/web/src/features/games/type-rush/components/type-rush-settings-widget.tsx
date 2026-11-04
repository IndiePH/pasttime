"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatTypeRushRoundModeLabel,
  TYPE_RUSH_ROUND_MODE_DEFAULT,
  TYPE_RUSH_ROUND_MODES,
  type TypeRushRoundMode,
} from "@pasttime/domain/games/type-rush"
import { Button } from "@/components/ui/button"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { typeRushSearchParams } from "@/features/games/type-rush/search-params"

interface TypeRushSettingsWidgetProps {
  className?: string
}

export function TypeRushSettingsWidget({
  className,
}: TypeRushSettingsWidgetProps) {
  const [modeParam, setModeParam] = useQueryState(
    "mode",
    typeRushSearchParams.mode
  )
  const [draftMode, setDraftMode] = React.useState<TypeRushRoundMode>(
    TYPE_RUSH_ROUND_MODE_DEFAULT
  )
  const mode = modeParam as TypeRushRoundMode

  const handleOpen = React.useCallback(() => {
    setDraftMode(mode)
  }, [mode])

  const handleApply = React.useCallback(() => {
    void setModeParam(
      draftMode === TYPE_RUSH_ROUND_MODE_DEFAULT ? null : draftMode
    )
  }, [draftMode, setModeParam])

  return (
    <GameSettingsWidget
      className={className}
      panelId="type-rush-settings-panel"
      description="Choose a daily or practice passage."
      summary={formatTypeRushRoundModeLabel(mode)}
      onOpen={handleOpen}
      onApply={handleApply}
      applyDisabled={draftMode === mode}
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">Passage mode</legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Passage mode"
        >
          {TYPE_RUSH_ROUND_MODES.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={draftMode === option ? "default" : "outline"}
              aria-pressed={draftMode === option}
              onClick={() => setDraftMode(option)}
            >
              {formatTypeRushRoundModeLabel(option)}
            </Button>
          ))}
        </div>
      </fieldset>
    </GameSettingsWidget>
  )
}
