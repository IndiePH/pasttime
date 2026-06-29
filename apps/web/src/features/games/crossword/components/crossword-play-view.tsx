"use client"

import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ErrorInfo, type ReactNode } from "react"
import { useQueryState } from "nuqs"

import { cn } from "@/lib/utils"
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
  findClueAtCell,
  type CrosswordClue,
  type CrosswordDirection,
} from "@pasttime/domain/games/crossword"
import { isNewDay } from "@pasttime/domain/daily"
import { GameContentPanel } from "@/features/games/components/game-content-panel"
import { GameDailyRolloverBanner } from "@/features/games/components"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import { CrosswordPlayPreferencesProvider, useCrosswordPlayPreferences } from "@/features/games/crossword/context/crossword-play-preferences-context"
import { IS_CROSSWORD_DEV } from "@/features/games/crossword/context/dev-flag"
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
  activeClue?: { direction: CrosswordDirection; number: number } | null
  blinkActiveClue?: boolean
  onClueClick?: (clue: CrosswordClue) => void
}

export function CrosswordClues({
  across,
  down,
  activeClue,
  blinkActiveClue = true,
  onClueClick,
}: CrosswordCluesProps) {
  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setLiRef = useCallback(
    (el: HTMLLIElement | null, key: string) => {
      if (el) liRefs.current.set(key, el)
      else liRefs.current.delete(key)
    },
    [],
  )

  // Scroll active clue into view and optionally blink
  useEffect(() => {
    if (!activeClue) return

    const key = `${activeClue.direction}-${activeClue.number}`
    const li = liRefs.current.get(key)
    if (!li) return

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches
    li.scrollIntoView({
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    })

    // Blink: skip when disabled or user prefers reduced motion
    if (!blinkActiveClue || reduced) return

    // Debounce: clear any pending blink timer
    if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current)

    li.classList.add("bg-primary/20")
    blinkTimeoutRef.current = setTimeout(() => {
      li.classList.remove("bg-primary/20")
    }, 260)

    // Cleanup on unmount or re-key
    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
        blinkTimeoutRef.current = null
      }
    }
  }, [activeClue, blinkActiveClue])

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <h3 className="text-sm font-medium">Across</h3>
        <ul className="mt-2 grid grid-cols-1 gap-y-1">
          {across.map((clue, i) => {
            const isActiveClue =
              activeClue?.direction === "across" &&
              activeClue.number === clue.number
            return (
              <li
                key={`across-${i}`}
                ref={(el) => setLiRef(el, `across-${clue.number}`)}
                className={cn(
                  "cursor-pointer text-sm",
                  isActiveClue &&
                    "rounded-sm bg-primary/10 font-semibold text-foreground",
                )}
                onClick={() => onClueClick?.(clue)}
              >
                <span className="font-medium">{clue.number}.</span>{" "}
                {clue.text}
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-medium">Down</h3>
        <ul className="mt-2 grid grid-cols-1 gap-y-1">
          {down.map((clue, i) => {
            const isActiveClue =
              activeClue?.direction === "down" &&
              activeClue.number === clue.number
            return (
              <li
                key={`down-${i}`}
                ref={(el) => setLiRef(el, `down-${clue.number}`)}
                className={cn(
                  "cursor-pointer text-sm",
                  isActiveClue &&
                    "rounded-sm bg-primary/10 font-semibold text-foreground",
                )}
                onClick={() => onClueClick?.(clue)}
              >
                <span className="font-medium">{clue.number}.</span>{" "}
                {clue.text}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

type CrosswordPlaySessionProps = {
  game: GameDefinition
  modeLabel: string
  gridSize: 7 | 9 | 11 | 13 | 15
  mode: "daily" | "random"
}

export function CrosswordPlaySession({
  game,
  modeLabel,
  gridSize,
  mode,
}: CrosswordPlaySessionProps) {
  const {
    showErrors,
    autoCheck,
    showWordSpanHighlight,
    showCornerArrowGlyph,
    showDirectionBorderColor,
    blinkActiveClue,
  } = useCrosswordPlayPreferences()
  const {
    gameState,
    newPuzzle,
    updateInput,
    recheckStatus,
    blocks,
    setActiveCell,
    direction,
    setDirection,
    activeClue,
  } = useCrosswordGame(gridSize, mode)

  // Daily rollover detection (D-02, D-03)
  const [showRollover, setShowRollover] = useState(false)
  const dailySeedRef = useRef(Date.now())

  useEffect(() => {
    if (mode !== "daily") {
      setShowRollover(false)
      return
    }

    // Check on focus — common case: user returns to tab after midnight
    const handleFocus = () => {
      if (isNewDay(dailySeedRef.current, Date.now())) {
        setShowRollover(true)
      }
    }

    // Also check periodically (every 60s) for long-lived tabs
    const interval = setInterval(handleFocus, 60_000)

    // Initial check
    handleFocus()

    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(interval)
    }
  }, [mode])

  // Recompute status after each input when auto-check is on.
  useEffect(() => {
    if (autoCheck && gameState) {
      recheckStatus()
    }
  }, [autoCheck, gameState, recheckStatus])

  // Helper: check if a given direction has a word at the cell.
  const otherDirectionHasWord = useCallback(
    (cell: { row: number; col: number }, dir: CrosswordDirection) => {
      return findClueAtCell(gameState.puzzle, cell, dir) !== null
    },
    [gameState.puzzle],
  )

  // Handle cell click: re-click on the active cell flips direction (D-02)
  // guarded so it never lands on a non-word direction (D-03).
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const clicked = { row, col }
      if (
        gameState.activeCell &&
        gameState.activeCell.row === row &&
        gameState.activeCell.col === col
      ) {
        // Re-click on already-active cell: flip to the other direction
        // only if it has a word at this cell.
        const other: CrosswordDirection =
          direction === "across" ? "down" : "across"
        if (otherDirectionHasWord(clicked, other)) {
          setDirection(other)
        }
        // No word in the other direction at this cell → no-op
      } else {
        // Fresh click: set active cell (direction resolves across-first
        // inside the hook's setActiveCell)
        setActiveCell(clicked)
      }
    },
    [
      gameState.activeCell,
      direction,
      setDirection,
      setActiveCell,
      otherDirectionHasWord,
    ],
  )

  // Handle clue click: navigate to the clue's starting cell and set direction
  const handleClueClick = useCallback(
    (clue: CrosswordClue) => {
      setActiveCell({ row: clue.row, col: clue.col })
      setDirection(clue.direction)
    },
    [setActiveCell, setDirection],
  )

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
      <>
        {showRollover && mode === "daily" && (
          <div className="mx-auto mb-4 w-full max-w-md">
            <GameDailyRolloverBanner
              onNewPuzzle={() => {
                newPuzzle()
                setShowRollover(false)
              }}
              onDismiss={() => setShowRollover(false)}
            />
          </div>
        )}
        <Card
          className="crossword-vars mx-auto overflow-visible text-left"
        style={{ "--crossword-grid-size": gridSize } as CSSProperties}
      >
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
          <div className="mx-auto flex w-fit max-w-full flex-col items-center landscape:flex-row landscape:items-start">
            <div className="flex flex-col items-center gap-2">
              <GameContentPanel sideInset={SIDE_INSET} className="pb-2.5">
                <CrosswordGrid
                  gridSize={gridSize}
                  inputs={gameState.inputs}
                  activeCell={gameState.activeCell}
                  showErrors={IS_CROSSWORD_DEV && showErrors}
                  blocks={blocks}
                  onCellChange={updateInput}
                  onCellClick={handleCellClick}
                  gridData={gameState.puzzle.grid}
                  direction={direction}
                  onDirectionChange={setDirection}
                  activeClue={activeClue}
                  showWordSpanHighlight={showWordSpanHighlight}
                  showCornerArrowGlyph={showCornerArrowGlyph}
                  showDirectionBorderColor={showDirectionBorderColor}
                  puzzle={gameState.puzzle}
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
              className="w-full landscape:w-72 landscape:shrink-0 landscape:pt-1 max-h-[60vh] overflow-y-auto"
              style={{ paddingInline: SIDE_INSET }}
            >
              <CrosswordClues
                across={gameState.puzzle.across}
                down={gameState.puzzle.down}
                activeClue={
                  activeClue
                    ? {
                        direction: activeClue.direction,
                        number: activeClue.number,
                      }
                    : null
                }
                blinkActiveClue={blinkActiveClue}
                onClueClick={handleClueClick}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </>
    </GamePlaySection>
  )
}

// ---------------------------------------------------------------------------
// Error boundary — catches generator failures from useCrosswordGame
// ---------------------------------------------------------------------------
interface CrosswordErrorState {
  hasError: boolean
}

class CrosswordPlaySessionErrorBoundary extends Component<
  { children: ReactNode; onRetry?: () => void },
  CrosswordErrorState
> {
  constructor(props: { children: ReactNode; onRetry?: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): CrosswordErrorState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error("CrosswordPlaySession error:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Could not generate puzzle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Could not generate a puzzle for this size. Try a different size
              or try again.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false })
                this.props.onRetry?.()
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )
    }
    return this.props.children
  }
}

export function CrosswordPlayView({ game, modeLabel }: CrosswordPlayViewProps) {
  const [size] = useQueryState("size", crosswordSearchParams.size)
  const [mode] = useQueryState("mode", crosswordSearchParams.mode)

  const gridSize = (size ?? 7) as 7 | 9 | 11 | 13 | 15
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

  const handleErrorRetry = useCallback(() => {
    window.location.href = crosswordLaunchPath(gridSize)
  }, [gridSize])

  return (
    <CrosswordPlayPreferencesProvider>
      <GamePlayShell layout="board">
        <CrosswordPlaySessionErrorBoundary onRetry={handleErrorRetry}>
          <CrosswordPlaySession
            key={sessionKey}
            game={game}
            modeLabel={modeLabel}
            gridSize={gridSize}
            mode={playMode}
          />
        </CrosswordPlaySessionErrorBoundary>
      </GamePlayShell>
    </CrosswordPlayPreferencesProvider>
  )
}
