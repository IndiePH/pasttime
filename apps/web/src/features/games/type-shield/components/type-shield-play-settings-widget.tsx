"use client"

import * as React from "react"

import {
  formatTypeShieldDifficultyLabel,
  formatTypeShieldModeLabel,
  TYPE_SHIELD_DIFFICULTIES,
  TYPE_SHIELD_DIFFICULTY_WPM,
  TYPE_SHIELD_MODES,
  type TypeShieldDifficulty,
  type TypeShieldMode,
} from "@pasttime/domain/games/type-shield"
import { Button } from "@/components/ui/button"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SettingsToggleField } from "@/features/games/components/settings-toggle-field"
import { useTypeShieldPlayPreferences } from "@/features/games/type-shield/hooks/use-type-shield-play-preferences"

interface TypeShieldPlaySettingsWidgetProps {
  className?: string
}

export function TypeShieldPlaySettingsWidget({
  className,
}: TypeShieldPlaySettingsWidgetProps) {
  const { cometEffects, setCometEffects, difficulty, setDifficulty, mode, setMode } =
    useTypeShieldPlayPreferences()
  const [draftEffects, setDraftEffects] = React.useState(cometEffects)
  const [draftDifficulty, setDraftDifficulty] =
    React.useState<TypeShieldDifficulty>(difficulty)
  const [draftMode, setDraftMode] = React.useState<TypeShieldMode>(mode)
  const [prevEffects, setPrevEffects] = React.useState(cometEffects)
  const [prevDifficulty, setPrevDifficulty] = React.useState(difficulty)
  const [prevMode, setPrevMode] = React.useState(mode)
  if (
    cometEffects !== prevEffects ||
    difficulty !== prevDifficulty ||
    mode !== prevMode
  ) {
    setPrevEffects(cometEffects)
    setPrevDifficulty(difficulty)
    setPrevMode(mode)
    setDraftEffects(cometEffects)
    setDraftDifficulty(difficulty)
    setDraftMode(mode)
  }
  const hasPendingChanges =
    draftEffects !== cometEffects ||
    draftDifficulty !== difficulty ||
    draftMode !== mode

  const handleOpen = React.useCallback(() => {
    setDraftEffects(cometEffects)
    setDraftDifficulty(difficulty)
    setDraftMode(mode)
  }, [cometEffects, difficulty, mode])

  const handleDismiss = React.useCallback(() => {
    setDraftEffects(cometEffects)
    setDraftDifficulty(difficulty)
    setDraftMode(mode)
  }, [cometEffects, difficulty, mode])

  const handleApply = React.useCallback(() => {
    setCometEffects(draftEffects)
    setDifficulty(draftDifficulty)
    setMode(draftMode)
  }, [
    draftDifficulty,
    draftEffects,
    draftMode,
    setCometEffects,
    setDifficulty,
    setMode,
  ])

  const band = TYPE_SHIELD_DIFFICULTY_WPM[draftDifficulty]

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,24rem)]"
      panelId="type-shield-play-settings-panel"
      description="Mode, pace, and effects for this round."
      summary={`${formatTypeShieldDifficultyLabel(difficulty)} · ${formatTypeShieldModeLabel(mode)} · ${
        cometEffects ? "Comet effects on" : "Comet effects off"
      }`}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Mode
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mode">
          {TYPE_SHIELD_MODES.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={draftMode === option ? "default" : "outline"}
              aria-pressed={draftMode === option}
              onClick={() => setDraftMode(option)}
            >
              {formatTypeShieldModeLabel(option)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Survival lasts 2 minutes. Endless runs until the shield falls.
        </p>
      </fieldset>
      <fieldset className="mt-4 space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Difficulty
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Difficulty">
          {TYPE_SHIELD_DIFFICULTIES.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={draftDifficulty === option ? "default" : "outline"}
              aria-pressed={draftDifficulty === option}
              onClick={() => setDraftDifficulty(option)}
            >
              {formatTypeShieldDifficultyLabel(option)}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {band.min}–{band.max} WPM.
          {draftDifficulty === "nightmare"
            ? " The field speeds up every few seconds."
            : null}{" "}
          The next round uses this pace.
        </p>
      </fieldset>
      <SettingsToggleField
        className="mt-4"
        label="Comet Effects"
        description="Burst a comet when its word is cleared, and shake the dome on impact."
        value={draftEffects}
        onValueChange={setDraftEffects}
      />
    </GameSettingsWidget>
  )
}
