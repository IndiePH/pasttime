"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatWordGuessRoundModeLabel,
  formatWordLengthLabel,
  WORD_GUESS_ROUND_MODE_DEFAULT,
  type WordGuessRoundMode,
  WORD_GUESS_LENGTH_DEFAULT,
  type WordGuessLength,
} from "@/domain/games/word-guess"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { WordGuessModePicker } from "@/features/games/word-guess/components/word-guess-mode-picker"
import { WordLengthPicker } from "@/features/games/word-guess/components/word-length-picker"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"

interface WordGuessSettingsWidgetProps {
  className?: string
}

export function WordGuessSettingsWidget({
  className,
}: WordGuessSettingsWidgetProps) {
  const [draftLength, setDraftLength] =
    React.useState<WordGuessLength>(WORD_GUESS_LENGTH_DEFAULT)
  const [draftMode, setDraftMode] =
    React.useState<WordGuessRoundMode>(WORD_GUESS_ROUND_MODE_DEFAULT)
  const [lettersParam, setLettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const [modeParam, setModeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const appliedLength = Number(lettersParam) as WordGuessLength
  const appliedMode = modeParam as WordGuessRoundMode
  const hasPendingChanges =
    draftLength !== appliedLength || draftMode !== appliedMode

  const handleOpen = React.useCallback(() => {
    setDraftLength(appliedLength)
    setDraftMode(appliedMode)
  }, [appliedLength, appliedMode])

  const handleApply = React.useCallback(() => {
    setLettersParam(String(draftLength))
    setModeParam(draftMode)
  }, [draftLength, draftMode, setLettersParam, setModeParam])

  return (
    <GameSettingsWidget
      className={className}
      panelId="word-guess-settings-panel"
      description="Word length for this session."
      summary={`${formatWordLengthLabel(appliedLength)} · ${formatWordGuessRoundModeLabel(appliedMode)}`}
      onOpen={handleOpen}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <div className="space-y-4">
        <WordLengthPicker
          compact
          value={draftLength}
          onValueChange={setDraftLength}
        />
        <WordGuessModePicker compact value={draftMode} onValueChange={setDraftMode} />
      </div>
    </GameSettingsWidget>
  )
}
