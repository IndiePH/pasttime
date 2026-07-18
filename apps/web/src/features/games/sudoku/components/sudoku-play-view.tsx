"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import { PlatformLink } from "@/platform/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  formatSudokuDifficultyLabel,
  getSudokuStorageKey,
  sudokuLaunchPath,
  sudokuPlayPath,
  type SudokuCell,
  type SudokuDifficulty,
  type SudokuGameState,
  type SudokuRoundMode,
} from "@pasttime/domain/games/sudoku"

import { GameBoardLoading } from "@/features/games/components/game-board-loading"
import { GameContentPanel } from "@/features/games/components/game-content-panel"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { PostSolveRanking } from "@/features/games/components/game-post-solve-ranking"
import { useStorage } from "@/infrastructure/storage"

import {
  SudokuPlayPreferencesProvider,
  useSudokuPlayPreferences,
} from "@/features/games/sudoku/context/sudoku-play-preferences-context"
import { useSudokuGame } from "@/features/games/sudoku/hooks/use-sudoku-game"
import { sudokuSearchParams } from "@/features/games/sudoku/search-params"

import { SudokuGrid } from "./sudoku-grid"
import { SudokuNumberPad } from "./sudoku-number-pad"

interface SudokuPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

const SIDE_INSET = "0.75rem"

/** `m:ss` under an hour, `h:mm:ss` once the round runs past 60 minutes. */
function formatSudokuElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

function modeLabelText(mode: SudokuRoundMode): string {
  return mode === "daily" ? "Daily puzzle" : "Endless puzzle"
}

interface SudokuPlaySessionReadyProps {
  game: GameDefinition
  modeLabel: string
  difficulty: SudokuDifficulty
  mode: SudokuRoundMode
  state: SudokuGameState
  elapsedMs: number
  selectCell: (index: number) => void
  placeDigit: ReturnType<typeof useSudokuGame>["placeDigit"]
  clearCell: () => void
  toggleCandidateMode: () => void
  setAutoCandidates: (on: boolean) => void
  undo: () => void
}

function SudokuPlaySessionReady({
  game,
  modeLabel,
  difficulty,
  mode,
  state,
  elapsedMs,
  selectCell,
  placeDigit,
  clearCell,
  toggleCandidateMode,
  setAutoCandidates,
  undo,
}: SudokuPlaySessionReadyProps) {
  const { autoCandidates } = useSudokuPlayPreferences()
  const storage = useStorage()

  // Keep the domain state's auto-candidate flag in sync with the persisted
  // play preference (once on mount, and again whenever the preference
  // changes elsewhere, e.g. a future play-settings widget).
  React.useEffect(() => {
    setAutoCandidates(autoCandidates)
  }, [autoCandidates, setAutoCandidates])

  const isPlaying = state.status === "playing"
  const isWon = state.status === "won"
  const cells: SudokuCell[] = state.cells

  // Endless rounds resume from storage by design (see useSudokuGame), so a
  // fresh round requires clearing the slot before a full navigation forces
  // the hook to regenerate instead of rehydrating the finished board.
  const handleNewEndless = React.useCallback(() => {
    storage.remove(getSudokuStorageKey(difficulty, "random"))
    window.location.href = sudokuPlayPath(difficulty, "random")
  }, [storage, difficulty])

  return (
    <GamePlaySection
      game={game}
      subtitle={`${modeLabel} · ${modeLabelText(mode)}`}
      headerDensity="compact"
      contentLayout="board"
      footer={
        <GamePlayFooterActions>
          {mode !== "daily" ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleNewEndless}
            >
              New game
            </Button>
          ) : null}
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={sudokuLaunchPath(difficulty)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      }
    >
      <Card className="sudoku-vars mx-auto overflow-visible text-left">
        <CardHeader
          className="gap-3 pt-2 landscape:flex-row landscape:items-start landscape:justify-between landscape:space-y-0"
          style={{ paddingInline: SIDE_INSET }}
        >
          <div className="space-y-1.5">
            <CardTitle>Sudoku</CardTitle>
            <CardDescription className="max-w-2xl landscape:hidden">
              Fill every row, column, and 3×3 box with 1–9. Click a cell, then
              type a number. Backspace clears.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 py-0.5 text-sm landscape:justify-end">
            <Badge variant="outline" className="leading-normal">
              {formatSudokuDifficultyLabel(difficulty)}
            </Badge>
            <Badge variant="outline" className="leading-normal">
              {modeLabelText(mode)}
            </Badge>
            <Badge
              variant="outline"
              className="leading-normal font-mono tabular-nums"
              aria-label="Elapsed time"
            >
              {formatSudokuElapsed(elapsedMs)}
            </Badge>
            <Badge variant="outline" className="leading-normal">
              {isWon ? "Solved" : "Solving"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pt-4 pb-2 landscape:space-y-3 landscape:pt-3 landscape:pb-2">
          <GameContentPanel sideInset={SIDE_INSET}>
            <SudokuGrid
              cells={cells}
              selectedIndex={state.selectedIndex}
              disabled={!isPlaying}
              onSelect={selectCell}
              onPlaceDigit={placeDigit}
              onClear={clearCell}
              onToggleCandidateMode={toggleCandidateMode}
            />
          </GameContentPanel>

          <div style={{ paddingInline: SIDE_INSET }}>
            <SudokuNumberPad
              disabled={!isPlaying}
              candidateMode={state.candidateMode}
              canUndo={state.undoStack.length > 0}
              onDigit={placeDigit}
              onClear={clearCell}
              onToggleCandidateMode={toggleCandidateMode}
              onUndo={undo}
            />
          </div>

          {isWon ? (
            <div
              className="flex w-full flex-col items-center gap-3"
              style={{ paddingInline: SIDE_INSET }}
              role="status"
              aria-live="polite"
            >
              <p className="text-center text-sm text-muted-foreground">
                Solved in <strong>{formatSudokuElapsed(elapsedMs)}</strong> —
                nice work!
              </p>
              {mode === "daily" ? <PostSolveRanking gameId="sudoku" /> : null}
              <div className="flex w-60 flex-col items-center gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <PlatformLink href="/games/sudoku/stats">
                    View stats
                  </PlatformLink>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleNewEndless}
                >
                  New endless
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <PlatformLink href={sudokuLaunchPath(difficulty)}>
                    Back to launch
                  </PlatformLink>
                </Button>
              </div>
            </div>
          ) : (
            <p
              className="min-h-5 w-full text-center text-sm text-muted-foreground"
              style={{ paddingInline: SIDE_INSET }}
              role="status"
              aria-live="polite"
            >
              {state.candidateMode
                ? "Candidate mode — tap digits to mark notes."
                : "\u00A0"}
            </p>
          )}
        </CardContent>
      </Card>
    </GamePlaySection>
  )
}

function SudokuPlaySession({
  game,
  modeLabel,
  difficulty,
  mode,
}: {
  game: GameDefinition
  modeLabel: string
  difficulty: SudokuDifficulty
  mode: SudokuRoundMode
}) {
  const sudoku = useSudokuGame(difficulty, mode)

  if (sudoku.status === "loading") {
    return <GameBoardLoading label="Generating sudoku…" />
  }

  if (sudoku.status === "error" || !sudoku.state) {
    return (
      <Card className="mx-auto w-full text-left">
        <CardHeader>
          <CardTitle>Could not load sudoku</CardTitle>
          <CardDescription>{sudoku.error ?? "Unknown error"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={sudoku.retry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <SudokuPlaySessionReady
      game={game}
      modeLabel={modeLabel}
      difficulty={difficulty}
      mode={mode}
      state={sudoku.state}
      elapsedMs={sudoku.elapsedMs}
      selectCell={sudoku.selectCell}
      placeDigit={sudoku.placeDigit}
      clearCell={sudoku.clearCell}
      toggleCandidateMode={sudoku.toggleCandidateMode}
      setAutoCandidates={sudoku.setAutoCandidates}
      undo={sudoku.undo}
    />
  )
}

export function SudokuPlayView({ game, modeLabel }: SudokuPlayViewProps) {
  const [difficultyParam] = useQueryState(
    "difficulty",
    sudokuSearchParams.difficulty,
  )
  const [modeParam] = useQueryState("mode", sudokuSearchParams.mode)

  const difficulty = difficultyParam as SudokuDifficulty
  const mode = modeParam as SudokuRoundMode
  const sessionKey = `${mode}:${difficulty}`
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!isMounted) {
    return (
      <GamePlayShell layout="board">
        <GameBoardLoading label="Loading sudoku…" />
      </GamePlayShell>
    )
  }

  return (
    <GamePlayShell layout="board">
      <SudokuPlayPreferencesProvider>
        <SudokuPlaySession
          key={sessionKey}
          game={game}
          modeLabel={modeLabel}
          difficulty={difficulty}
          mode={mode}
        />
      </SudokuPlayPreferencesProvider>
    </GamePlayShell>
  )
}
