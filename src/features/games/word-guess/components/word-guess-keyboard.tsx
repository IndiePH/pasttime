import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WordGuessLetterState } from "@/domain/games/word-guess"
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

const KEY_STATE_CLASS_NAME: Partial<Record<WordGuessLetterState, string>> = {
  correct:
    "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90 dark:border-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-500/90",
  present:
    "border-amber-500 bg-amber-500 text-white hover:bg-amber-500/90 dark:border-amber-400 dark:bg-amber-400 dark:hover:bg-amber-400/90",
  absent:
    "border-muted-foreground/70 bg-muted-foreground/70 text-white hover:bg-muted-foreground/60 dark:border-muted-foreground dark:bg-muted-foreground dark:hover:bg-muted-foreground/90",
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
              className={cn(
                "h-9 min-w-7 px-1.5 text-xs font-semibold sm:h-10 sm:min-w-9 sm:px-2 sm:text-sm",
                normalizedKeyStates[letter]
                  ? KEY_STATE_CLASS_NAME[normalizedKeyStates[letter]]
                  : null,
              )}
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
            className={cn(
              "h-9 min-w-7 px-1.5 text-xs font-semibold sm:h-10 sm:min-w-9 sm:px-2 sm:text-sm",
              normalizedKeyStates[letter]
                ? KEY_STATE_CLASS_NAME[normalizedKeyStates[letter]]
                : null,
            )}
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
