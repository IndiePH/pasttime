"use client"

import * as React from "react"

import { formatPlayingCardVariantLabel } from "@pasttime/domain/games"
import { CardSkinPicker } from "@/features/games/cards/card-skin-picker"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { SettingsToggleField } from "@/features/games/components/settings-toggle-field"
import { useSolitairePlayPreferencesContext } from "@/features/games/solitaire/context/solitaire-play-preferences-context"

interface SolitairePlaySettingsWidgetProps {
  className?: string
}

export function SolitairePlaySettingsWidget({
  className,
}: SolitairePlaySettingsWidgetProps) {
  const {
    cardVariant: variant,
    setCardVariant: setVariant,
    autoStackEnabled,
    setAutoStackEnabled,
  } = useSolitairePlayPreferencesContext()
  const [draftVariant, setDraftVariant] = React.useState(variant)
  const [draftAutoStack, setDraftAutoStack] = React.useState(autoStackEnabled)
  const hasPendingChanges =
    draftVariant !== variant || draftAutoStack !== autoStackEnabled

  const handleOpen = React.useCallback(() => {
    setDraftVariant(variant)
    setDraftAutoStack(autoStackEnabled)
  }, [autoStackEnabled, variant])

  const handleDismiss = React.useCallback(() => {
    setDraftVariant(variant)
    setDraftAutoStack(autoStackEnabled)
  }, [autoStackEnabled, variant])

  const handleApply = React.useCallback(() => {
    setVariant(draftVariant)
    setAutoStackEnabled(draftAutoStack)
  }, [draftAutoStack, draftVariant, setAutoStackEnabled, setVariant])

  const summary = [
    formatPlayingCardVariantLabel(variant),
    autoStackEnabled ? "Auto-stack on" : "Auto-stack off",
  ].join(" · ")

  return (
    <GameSettingsWidget
      className={className}
      panelClassName="w-[min(100vw-2rem,22rem)]"
      panelId="solitaire-play-settings-panel"
      description="Gameplay and card appearance during this session."
      summary={summary}
      onOpen={handleOpen}
      onDismiss={handleDismiss}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <div className="space-y-5">
        <CardSkinPicker compact value={draftVariant} onValueChange={setDraftVariant} />
        <SettingsToggleField
          label="Auto-stack cards"
          description="Move playable cards to foundations automatically after each move."
          value={draftAutoStack}
          onValueChange={setDraftAutoStack}
        />
      </div>
    </GameSettingsWidget>
  )
}
