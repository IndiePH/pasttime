"use client"

import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  formatWordGuessRoundModeLabel,
  WORD_GUESS_ROUND_MODES,
  type WordGuessRoundMode,
} from "@/domain/games/word-guess"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { cn } from "@/lib/utils"

type WordGuessModePickerProps = {
  className?: string
  compact?: boolean
} & (
  | {
      value: WordGuessRoundMode
      onValueChange: (mode: WordGuessRoundMode) => void
    }
  | {
      value?: never
      onValueChange?: never
    }
)

export function WordGuessModePicker(props: WordGuessModePickerProps) {
  const { className, compact = false, value, onValueChange } = props
  const [modeParam, setModeParam] = useQueryState("mode", wordGuessSearchParams.mode)
  const isControlled = onValueChange !== undefined
  const activeMode = isControlled ? value : (modeParam as WordGuessRoundMode)

  function handleSelect(mode: WordGuessRoundMode) {
    if (isControlled) {
      onValueChange(mode)
    } else {
      setModeParam(mode)
    }
  }

  return (
    <fieldset className={cn(compact ? "space-y-2" : "space-y-3 text-left", className)}>
      {compact ? (
        <legend className="sr-only">Round type</legend>
      ) : (
        <>
          <legend className="text-sm font-medium">Round type</legend>
          <p className="text-xs text-muted-foreground">
            Choose a new random puzzle or play the same daily puzzle.
          </p>
        </>
      )}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Round type">
        {WORD_GUESS_ROUND_MODES.map((mode) => {
          const isActive = activeMode === mode
          return (
            <Button
              key={mode}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              aria-pressed={isActive}
              onClick={() => handleSelect(mode)}
            >
              {formatWordGuessRoundModeLabel(mode)}
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}
