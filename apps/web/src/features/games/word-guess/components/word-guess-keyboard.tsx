import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WordGuessLetterState } from "@pasttime/domain/games/word-guess"
import { Delete } from "lucide-react"

const KEYBOARD_ROWS = [
  {
    keys: "QWERTYUIOP",
    className: "",
  },
  {
    keys: "ASDFGHJKL",
    className: "pl-3",
  },
] as const

interface WordGuessKeyboardProps {
  keyStates: Partial<Record<string, WordGuessLetterState>>
  disabled?: boolean
  onLetter: (letter: string) => void
  onEnter: () => void
  onBackspace: () => void
}

const KEY_BASE_CLASS_NAME =
  "h-9 min-w-7 px-1.5 text-xs font-semibold transition-[opacity,background-color,border-color,color] sm:h-10 sm:min-w-9 sm:px-2 sm:text-sm"

/** Unused keys: full contrast so they read as still available. */
const AVAILABLE_KEY_CLASS_NAME =
  "border-border bg-muted text-foreground shadow-xs hover:bg-muted/90 dark:border-input dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"

/**
 * Used keys recede (lower opacity) while keeping semantic hue where it matters.
 * Absent keys are most faded — achromatic, low salience (spent letters).
 */
const KEY_STATE_CLASS_NAME: Partial<Record<WordGuessLetterState, string>> = {
  correct:
    "border-emerald-600/90 bg-emerald-600/90 text-white opacity-80 hover:opacity-90 dark:border-emerald-500/90 dark:bg-emerald-500/90 dark:hover:opacity-90",
  present:
    "border-amber-500/90 bg-amber-500/90 text-white opacity-80 hover:opacity-90 dark:border-amber-400/90 dark:bg-amber-400/90 dark:hover:opacity-90",
  absent:
    "border-muted-foreground/25 bg-muted-foreground/20 text-muted-foreground/70 opacity-45 hover:opacity-55 dark:border-muted-foreground/20 dark:bg-muted-foreground/15 dark:text-muted-foreground/60 dark:opacity-40 dark:hover:opacity-50",
}

function letterKeyClassName(
  letter: string,
  keyStates: Partial<Record<string, WordGuessLetterState>>,
): string {
  const state = keyStates[letter]

  return cn(
    KEY_BASE_CLASS_NAME,
    state ? KEY_STATE_CLASS_NAME[state] : AVAILABLE_KEY_CLASS_NAME,
  )
}

export function WordGuessKeyboard({
  keyStates,
  disabled = false,
  onLetter,
  onEnter,
  onBackspace,
}: WordGuessKeyboardProps) {
  const normalizedKeyStates = Object.fromEntries(
    Object.entries(keyStates).map(([letter, state]) => [letter.toUpperCase(), state]),
  ) as Partial<Record<string, WordGuessLetterState>>

  return (
    <div className="space-y-2" aria-label="On-screen keyboard">
      {KEYBOARD_ROWS.map((row) => (
        <div
          key={row.keys}
          className={cn("flex justify-center gap-1 sm:gap-1.5", row.className)}
        >
          {row.keys.split("").map((letter) => (
            <Button
              key={letter}
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              className={letterKeyClassName(letter, normalizedKeyStates)}
              onClick={() => onLetter(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      ))}

      <div className="flex justify-center gap-1 sm:gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          className="h-9 min-w-12 px-2 text-xs font-semibold sm:h-10 sm:min-w-16 sm:px-4 sm:text-sm"
          onClick={onEnter}
        >
          Enter
        </Button>
        {"ZXCVBNM".split("").map((letter) => (
          <Button
            key={letter}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className={letterKeyClassName(letter, normalizedKeyStates)}
            onClick={() => onLetter(letter)}
          >
            {letter}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          aria-label="Backspace"
          className="h-9 min-w-9 px-2 text-xs font-semibold sm:h-10 sm:min-w-12 sm:px-3 sm:text-sm"
          onClick={onBackspace}
        >
          <Delete className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
