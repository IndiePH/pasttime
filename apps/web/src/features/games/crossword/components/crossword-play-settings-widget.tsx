"use client"

import * as React from "react"

import { IS_CROSSWORD_DEV } from "@/features/games/crossword/context/dev-flag"
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
    showWordSpanHighlight,
    setShowWordSpanHighlight,
    showCornerArrowGlyph,
    setShowCornerArrowGlyph,
    showDirectionBorderColor,
    setShowDirectionBorderColor,
    blinkActiveClue,
    setBlinkActiveClue,
  } = useCrosswordPlayPreferences()

  // Draft state — all 6 prefs
  const [draftShowErrors, setDraftShowErrors] = React.useState(showErrors)
  const [draftAutoCheck, setDraftAutoCheck] = React.useState(autoCheck)
  const [draftShowWordSpanHighlight, setDraftShowWordSpanHighlight] =
    React.useState(showWordSpanHighlight)
  const [draftShowCornerArrowGlyph, setDraftShowCornerArrowGlyph] =
    React.useState(showCornerArrowGlyph)
  const [draftShowDirectionBorderColor, setDraftShowDirectionBorderColor] =
    React.useState(showDirectionBorderColor)
  const [draftBlinkActiveClue, setDraftBlinkActiveClue] =
    React.useState(blinkActiveClue)

  const hasPendingChanges =
    draftShowErrors !== showErrors ||
    draftAutoCheck !== autoCheck ||
    draftShowWordSpanHighlight !== showWordSpanHighlight ||
    draftShowCornerArrowGlyph !== showCornerArrowGlyph ||
    draftShowDirectionBorderColor !== showDirectionBorderColor ||
    draftBlinkActiveClue !== blinkActiveClue

  const handleOpen = React.useCallback(() => {
    setDraftShowErrors(showErrors)
    setDraftAutoCheck(autoCheck)
    setDraftShowWordSpanHighlight(showWordSpanHighlight)
    setDraftShowCornerArrowGlyph(showCornerArrowGlyph)
    setDraftShowDirectionBorderColor(showDirectionBorderColor)
    setDraftBlinkActiveClue(blinkActiveClue)
  }, [
    showErrors,
    autoCheck,
    showWordSpanHighlight,
    showCornerArrowGlyph,
    showDirectionBorderColor,
    blinkActiveClue,
  ])

  const handleDismiss = React.useCallback(() => {
    setDraftShowErrors(showErrors)
    setDraftAutoCheck(autoCheck)
    setDraftShowWordSpanHighlight(showWordSpanHighlight)
    setDraftShowCornerArrowGlyph(showCornerArrowGlyph)
    setDraftShowDirectionBorderColor(showDirectionBorderColor)
    setDraftBlinkActiveClue(blinkActiveClue)
  }, [
    showErrors,
    autoCheck,
    showWordSpanHighlight,
    showCornerArrowGlyph,
    showDirectionBorderColor,
    blinkActiveClue,
  ])

  const handleApply = React.useCallback(() => {
    setShowErrors(draftShowErrors)
    setAutoCheck(draftAutoCheck)
    setShowWordSpanHighlight(draftShowWordSpanHighlight)
    setShowCornerArrowGlyph(draftShowCornerArrowGlyph)
    setShowDirectionBorderColor(draftShowDirectionBorderColor)
    setBlinkActiveClue(draftBlinkActiveClue)
  }, [
    draftShowErrors,
    draftAutoCheck,
    draftShowWordSpanHighlight,
    draftShowCornerArrowGlyph,
    draftShowDirectionBorderColor,
    draftBlinkActiveClue,
    setShowErrors,
    setAutoCheck,
    setShowWordSpanHighlight,
    setShowCornerArrowGlyph,
    setShowDirectionBorderColor,
    setBlinkActiveClue,
  ])

  const summaryParts: string[] = [
    `Word highlight ${showWordSpanHighlight ? "on" : "off"}`,
    `Direction arrow ${showCornerArrowGlyph ? "on" : "off"}`,
    `Direction border ${showDirectionBorderColor ? "on" : "off"}`,
    `Blink clue ${blinkActiveClue ? "on" : "off"}`,
  ]
  if (IS_CROSSWORD_DEV) {
    summaryParts.push(
      `Errors ${showErrors ? "on" : "off"}`,
      `Auto-check ${autoCheck ? "on" : "off"}`,
    )
  }
  const summary = summaryParts.join(" · ")

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
          label="Word highlight"
          description="Tint the cells of the active word."
          value={draftShowWordSpanHighlight}
          onValueChange={setDraftShowWordSpanHighlight}
        />
        <SettingsToggleField
          label="Direction arrow"
          description="Show a small arrow in the active cell indicating direction."
          value={draftShowCornerArrowGlyph}
          onValueChange={setDraftShowCornerArrowGlyph}
        />
        <SettingsToggleField
          label="Direction border color"
          description="Color the ring of the active cell by direction (across/down)."
          value={draftShowDirectionBorderColor}
          onValueChange={setDraftShowDirectionBorderColor}
        />
        <SettingsToggleField
          label="Blink active clue"
          description="Briefly flash the active clue in the panel when it changes."
          value={draftBlinkActiveClue}
          onValueChange={setDraftBlinkActiveClue}
        />
        {IS_CROSSWORD_DEV && (
          <>
            <hr className="border-border" />
            <p className="text-xs text-muted-foreground">
              Debug settings (dev only)
            </p>
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
          </>
        )}
      </div>
    </GameSettingsWidget>
  )
}
