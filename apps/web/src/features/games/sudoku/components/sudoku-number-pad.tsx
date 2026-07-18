"use client"

import { Delete, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SudokuDigit } from "@pasttime/domain/games/sudoku"

interface SudokuNumberPadProps {
  disabled?: boolean
  candidateMode: boolean
  canUndo: boolean
  onDigit: (digit: SudokuDigit) => void
  onClear: () => void
  onToggleCandidateMode: () => void
  onUndo: () => void
}

const DIGITS: SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const DIGIT_BUTTON_CLASS_NAME =
  "h-9 w-9 px-0 text-sm font-semibold sm:h-10 sm:w-10 sm:text-base"

export function SudokuNumberPad({
  disabled = false,
  candidateMode,
  canUndo,
  onDigit,
  onClear,
  onToggleCandidateMode,
  onUndo,
}: SudokuNumberPadProps) {
  return (
    <div className="flex flex-col items-center gap-2" aria-label="Sudoku number pad">
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {DIGITS.map((digit) => (
          <Button
            key={digit}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className={DIGIT_BUTTON_CLASS_NAME}
            onClick={() => onDigit(digit)}
          >
            {digit}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9 px-2.5 text-xs font-semibold sm:h-10 sm:text-sm"
          onClick={onClear}
        >
          <Delete className="size-4" aria-hidden />
          Clear
        </Button>
        <Button
          type="button"
          variant={candidateMode ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          aria-pressed={candidateMode}
          className="h-9 px-2.5 text-xs font-semibold sm:h-10 sm:text-sm"
          onClick={onToggleCandidateMode}
        >
          {candidateMode ? "Candidates" : "Normal"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !canUndo}
          aria-label="Undo"
          className="h-9 px-2.5 text-xs font-semibold sm:h-10 sm:text-sm"
          onClick={onUndo}
        >
          <Undo2 className="size-4" aria-hidden />
          Undo
        </Button>
      </div>
    </div>
  )
}
