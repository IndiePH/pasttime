"use client"

import { useQueryState } from "nuqs"

import {
  SUDOKU_DIFFICULTIES,
  formatSudokuDifficultyLabel,
  type SudokuDifficulty,
} from "@pasttime/domain/games/sudoku"
import { Button } from "@/components/ui/button"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { sudokuSearchParams } from "@/features/games/sudoku/search-params"

interface SudokuSettingsWidgetProps {
  className?: string
}

export function SudokuSettingsWidget({
  className,
}: SudokuSettingsWidgetProps) {
  const [difficultyParam, setDifficultyParam] = useQueryState(
    "difficulty",
    sudokuSearchParams.difficulty,
  )
  const difficulty = difficultyParam as SudokuDifficulty

  function handleSelect(next: SudokuDifficulty) {
    void setDifficultyParam(next)
  }

  return (
    <GameSettingsWidget
      className={className}
      panelId="sudoku-settings-panel"
      description="Difficulty for this session."
      summary={formatSudokuDifficultyLabel(difficulty)}
      applyDisabled
      onOpen={() => {}}
      onDismiss={() => {}}
      onApply={() => {}}
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">Difficulty</legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Difficulty"
        >
          {SUDOKU_DIFFICULTIES.map((option) => {
            const isActive = difficulty === option
            return (
              <Button
                key={option}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                aria-pressed={isActive}
                onClick={() => handleSelect(option)}
              >
                {formatSudokuDifficultyLabel(option)}
              </Button>
            )
          })}
        </div>
      </fieldset>
    </GameSettingsWidget>
  )
}
