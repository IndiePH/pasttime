"use client"

import { useQueryState } from "nuqs"

import type { GameDefinition } from "@pasttime/domain/games"
import {
  sudokuPlayPath,
  type SudokuDifficulty,
} from "@pasttime/domain/games/sudoku"
import { GameLaunchActions } from "@/features/games/components/game-launch-actions"
import { GamePageShell } from "@/features/games/components/game-page-shell"
import { GameSessionHeader } from "@/features/games/components/game-session-header"
import { GameOverviewSection } from "@/features/games/content/game-overview-section"
import { SudokuSettingsWidget } from "@/features/games/sudoku/components/sudoku-settings-widget"
import { sudokuSearchParams } from "@/features/games/sudoku/search-params"
import { useDailyCompleted } from "@/features/games/hooks/use-daily-completed"

interface SudokuLaunchViewProps {
  game: GameDefinition
}

export function SudokuLaunchView({ game }: SudokuLaunchViewProps) {
  const [difficultyParam] = useQueryState(
    "difficulty",
    sudokuSearchParams.difficulty,
  )
  const difficulty = difficultyParam as SudokuDifficulty
  const isDailyCompleted = useDailyCompleted("sudoku", difficulty)

  return (
    <>
      <GamePageShell>
        <GameSessionHeader game={game} subtitle={game.description} />
        <SudokuSettingsWidget className="mt-6" />
        <GameLaunchActions
          game={game}
          playHref={sudokuPlayPath(difficulty, isDailyCompleted ? "random" : "daily")}
          dailyCompleted={isDailyCompleted}
          statsHref="/games/sudoku/stats"
        />
      </GamePageShell>
      <GameOverviewSection gameId={game.id} gameTitle={game.title} />
    </>
  )
}
