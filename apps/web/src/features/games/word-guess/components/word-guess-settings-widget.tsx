"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatWordLengthLabel,
  WORD_GUESS_LENGTH_DEFAULT,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { WordLengthPicker } from "@/features/games/word-guess/components/word-length-picker"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { Switch } from "@/components/ui/switch"

interface WordGuessSettingsWidgetProps {
  className?: string
}

export function WordGuessSettingsWidget({
  className,
}: WordGuessSettingsWidgetProps) {
  const [draftLength, setDraftLength] =
    React.useState<WordGuessLength>(WORD_GUESS_LENGTH_DEFAULT)
  const [draftHardMode, setDraftHardMode] = React.useState(false)
  const [lettersParam, setLettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const [hardModeParam, setHardModeParam] = useQueryState(
    "hardMode",
    wordGuessSearchParams.hardMode,
  )
  const appliedLength = Number(lettersParam) as WordGuessLength
  const appliedHardMode: boolean = hardModeParam ?? false
  const hasPendingChanges = draftLength !== appliedLength || draftHardMode !== appliedHardMode

  const handleOpen = React.useCallback(() => {
    setDraftLength(appliedLength)
    setDraftHardMode(appliedHardMode)
  }, [appliedLength, appliedHardMode])

  const handleApply = React.useCallback(() => {
    setLettersParam(String(draftLength))
    setHardModeParam(draftHardMode || null)
  }, [draftLength, draftHardMode, setLettersParam, setHardModeParam])

  return (
    <GameSettingsWidget
      className={className}
      panelId="word-guess-settings-panel"
      description="Word length for this session."
      summary={`${formatWordLengthLabel(appliedLength)}${appliedHardMode ? " · Hard mode" : ""}`}
      onOpen={handleOpen}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <WordLengthPicker
        compact
        value={draftLength}
        onValueChange={setDraftLength}
      />

      <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            Hard mode
          </p>
          <p className="text-xs text-muted-foreground">
            Correctly placed letters must be reused in the same positions for
            all subsequent guesses.
          </p>
        </div>
        <Switch
          checked={draftHardMode}
          onCheckedChange={setDraftHardMode}
        />
      </div>
    </GameSettingsWidget>
  )
}
