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

interface WordGuessSettingsWidgetProps {
  className?: string
}

export function WordGuessSettingsWidget({
  className,
}: WordGuessSettingsWidgetProps) {
  const [draftLength, setDraftLength] =
    React.useState<WordGuessLength>(WORD_GUESS_LENGTH_DEFAULT)
  const [lettersParam, setLettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const appliedLength = Number(lettersParam) as WordGuessLength
  const hasPendingChanges = draftLength !== appliedLength

  const handleOpen = React.useCallback(() => {
    setDraftLength(appliedLength)
  }, [appliedLength])

  const handleApply = React.useCallback(() => {
    setLettersParam(String(draftLength))
  }, [draftLength, setLettersParam])

  return (
    <GameSettingsWidget
      className={className}
      panelId="word-guess-settings-panel"
      description="Word length for this session."
      summary={formatWordLengthLabel(appliedLength)}
      onOpen={handleOpen}
      onApply={handleApply}
      applyDisabled={!hasPendingChanges}
    >
      <WordLengthPicker
        compact
        value={draftLength}
        onValueChange={setDraftLength}
      />
    </GameSettingsWidget>
  )
}
