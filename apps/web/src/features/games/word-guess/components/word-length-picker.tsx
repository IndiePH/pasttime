"use client"

import { useQueryState } from "nuqs"

import { Button } from "@/components/ui/button"
import {
  WORD_GUESS_LENGTHS,
  type WordGuessLength,
} from "@pasttime/domain/games/word-guess"
import { wordGuessSearchParams } from "@/features/games/word-guess/search-params"
import { cn } from "@/lib/utils"

type WordLengthPickerProps = {
  className?: string
  /** Hides legend and helper copy when embedded in the settings panel. */
  compact?: boolean
} & (
  | {
      value: WordGuessLength
      onValueChange: (length: WordGuessLength) => void
    }
  | {
      value?: never
      onValueChange?: never
    }
)

export function WordLengthPicker(props: WordLengthPickerProps) {
  const { className, compact = false, value, onValueChange } = props
  const [lettersParam, setLettersParam] = useQueryState(
    "letters",
    wordGuessSearchParams.letters,
  )
  const isControlled = onValueChange !== undefined
  const activeLength = isControlled
    ? value
    : (Number(lettersParam) as WordGuessLength)

  function handleSelect(length: WordGuessLength) {
    if (isControlled) {
      onValueChange(length)
    } else {
      setLettersParam(String(length))
    }
  }

  return (
    <fieldset className={cn(compact ? "space-y-2" : "space-y-3 text-left", className)}>
      {compact ? (
        <legend className="sr-only">Word length</legend>
      ) : (
        <>
          <legend className="text-sm font-medium">Word length</legend>
          <p className="text-xs text-muted-foreground">
            How many letters to guess. Default game mode uses 5.
          </p>
        </>
      )}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Word length"
      >
        {WORD_GUESS_LENGTHS.map((length) => {
          const isActive = activeLength === length
          return (
            <Button
              key={length}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              aria-pressed={isActive}
              onClick={() => handleSelect(length)}
            >
              {length} letters
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}
