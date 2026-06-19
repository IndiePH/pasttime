"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useQueryState } from "nuqs"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlatformLink } from "@/platform/navigation"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  crosswordLaunchPath,
  type CrosswordClue,
} from "@pasttime/domain/games/crossword"
import { GameContentPanel } from "@/features/games/components/game-content-panel"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { CrosswordPlayPreferencesProvider } from "@/features/games/crossword/context/crossword-play-preferences-context"
import { useCrosswordPlayPreferences } from "@/features/games/crossword/context/crossword-play-preferences-context"
import { CrosswordGrid } from "@/features/games/crossword/components/crossword-grid"
import { useCrosswordGame } from "@/features/games/crossword/hooks/use-crossword-game"
import { crosswordSearchParams } from "@/features/games/crossword/search-params"

interface CrosswordPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

const SIDE_INSET = "calc(var(--crossword-cell-w) * 0.35)"

interface CrosswordCluesProps {
  across: CrosswordClue[]
  down: CrosswordClue[]
}

function CrosswordClues({ across, down }: CrosswordCluesProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <h3 className="text-sm font-medium">Across</h3>
        <ul className="mt-2 grid grid-cols-1 gap-y-1">
          {across.map((clue, i) => (
            <li key={`across-${i}`} className="text-sm">
              <span className="font-medium">{clue.number}.</span> {clue.text}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-medium">Down</h3>
        <ul className="mt-2 grid grid-cols-1 gap-y-1">
          {down.map((clue, i) => (
            <li key={`down-${i}`} className="text-sm">
              <span className="font-medium">{clue.number}.</span> {clue.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

type CrosswordPlaySessionProps = {
  game: GameDefinition
  modeLabel: string
  gridSize: 5 | 7 | 9 | 11 | 13 | 15
  mode: "daily" | "random"
}

function CrosswordPlaySession({
  game,
  modeLabel,
  gridSize,
  mode,
}: CrosswordPlaySessionProps) {
  const { showErrors, autoCheck } = useCrosswordPlayPreferences()
  const {
    gameState,
    newPuzzle,
    updateInput,
    recheckStatus,
    blocks,
    setActiveCell,
  } = useCrosswordGame(gridSize, mode)

  // Recompute status after each input when auto-check is on.
  useEffect(() => {
    if (autoCheck && gameState) {
      recheckStatus()
    }
  }, [autoCheck, gameState, recheckStatus])

  const subtitle = `${modeLabel} · ${mode === "daily" ? "Daily puzzle" : "Random puzzle"}`
  const modeLabelBadge = mode === "daily" ? "Daily puzzle" : "Random puzzle"

  return (
    <GamePlaySection
      game={game}
      subtitle={subtitle}
      headerDensity="compact"
      contentLayout="board"
      footer={
        <GamePlayFooterActions>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={newPuzzle}
          >
            New puzzle
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <PlatformLink href={crosswordLaunchPath(gridSize)}>
              Back to setup
            </PlatformLink>
          </Button>
        </GamePlayFooterActions>
      }
    >
      <Card className="crossword-vars mx-auto overflow-visible text-left">
        <CardHeader
          className="gap-3 pt-2 landscape:flex-row landscape:items-start landscape:justify-between landscape:space-y-0"
          style={{ paddingInline: SIDE_INSET }}
        >
          <div className="space-y-1.5">
            <CardTitle>Crossword</CardTitle>
            <CardDescription className="max-w-2xl landscape:hidden">
              Fill the grid using the across and down clues. Click a cell, then
              type letters. Backspace clears.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 py-0.5 text-sm landscape:justify-end">
            <Badge variant="outline" className="leading-normal">
              {gridSize}×{gridSize}
            </Badge>
            <Badge variant="outline" className="leading-normal">
              {modeLabelBadge}
            </Badge>
            <Badge variant="outline" className="leading-normal">
              {gameState.status === "won" ? "Solved" : "Solving"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-4 pb-2 landscape:pt-3 landscape:pb-2">
          <div className="mx-auto flex w-fit max-w-full flex-col items-center gap-4 landscape:flex-row landscape:items-start landscape:gap-8">
            <div className="flex flex-col items-center gap-2">
              <GameContentPanel sideInset={SIDE_INSET} className="pb-2.5">
                <CrosswordGrid
                  gridSize={gridSize}
                  inputs={gameState.inputs}
                  activeCell={gameState.activeCell}
                  showErrors={showErrors}
                  blocks={blocks}
                  onCellChange={updateInput}
                  onCellClick={(row, col) => setActiveCell({ row, col })}
                  gridData={gameState.puzzle.grid}
                />
              </GameContentPanel>
              <p
                className="min-h-5 w-full text-center text-sm text-muted-foreground"
                style={{ paddingInline: SIDE_INSET }}
                role="status"
                aria-live="polite"
              >
                {gameState.status === "won"
                  ? "Puzzle solved — nice work!"
                  : `${gameState.puzzle.across.length + gameState.puzzle.down.length} clues to solve.`}
              </p>
            </div>

            <div
              className="w-full landscape:w-64 landscape:shrink-0 landscape:pt-1 max-h-[60vh] overflow-y-auto"
              style={{ paddingInline: SIDE_INSET }}
            >
              <CrosswordClues
                across={gameState.puzzle.across}
                down={gameState.puzzle.down}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </GamePlaySection>
  )
}

export function CrosswordPlayView({ game, modeLabel }: CrosswordPlayViewProps) {
  const [size] = useQueryState("size", crosswordSearchParams.size)
  const [mode] = useQueryState("mode", crosswordSearchParams.mode)

  const gridSize = (size ?? 15) as 5 | 7 | 9 | 11 | 13 | 15
  const playMode = (mode ?? "daily") as "daily" | "random"
  const sessionKey = `${playMode}:${gridSize}`
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!isMounted) {
    return (
      <GamePlayShell layout="board">
        <Card className="crossword-vars mx-auto w-full text-left">
          <CardHeader>
            <CardTitle>Loading game…</CardTitle>
            <CardDescription>
              Preparing your board and saved progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </GamePlayShell>
    )
  }

  return (
    <GamePlayShell layout="board">
      <CrosswordPlayPreferencesProvider>
        <CrosswordPlaySession
          key={sessionKey}
          game={game}
          modeLabel={modeLabel}
          gridSize={gridSize}
          mode={playMode}
        />
      </CrosswordPlayPreferencesProvider>
    </GamePlayShell>
  )
}
