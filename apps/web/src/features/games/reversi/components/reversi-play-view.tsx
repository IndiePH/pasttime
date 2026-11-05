"use client"

import { useEffect, useRef, useState } from "react"

import { gamePath } from "@pasttime/domain/games"
import type { GameDefinition } from "@pasttime/domain/games"
import {
  countDiscs,
  formatPass,
  formatResult,
  formatTurn,
  nextStep,
} from "@pasttime/domain/games/reversi"
import { Button } from "@/components/ui/button"
import { GamePlayFooterActions } from "@/features/games/components/game-play-footer-actions"
import { GamePlaySection } from "@/features/games/components/game-play-section"
import { GamePlayShell } from "@/features/games/components/game-play-shell"
import {
  GamePostSolveActionStack,
  GamePostSolveDialog,
} from "@/features/games/components/game-post-solve-dialog"
import { useReversiGame } from "@/features/games/reversi/hooks/use-reversi-game"
import { PlatformLink } from "@/platform/navigation"

import { ReversiBoard } from "./reversi-board"

interface ReversiPlayViewProps {
  game: GameDefinition
  modeLabel: string
}

export function ReversiPlayView({ game, modeLabel }: ReversiPlayViewProps) {
  const { session, board, motion, flippingLabel, place, newGame } = useReversiGame()
  const { position } = session
  const display = { ...position, board }
  const [resultsOpen, setResultsOpen] = useState(false)
  const resultSeen = useRef(false)

  useEffect(() => {
    if (position.status !== "ended") {
      resultSeen.current = false
      return
    }
    if (resultSeen.current) {
      return
    }
    resultSeen.current = true
    setResultsOpen(true)
  }, [position.status])

  const step = nextStep(session)
  const scores = countDiscs(display)
  const result = formatResult(position)
  const resultTitle =
    position.winner === "draw"
      ? "Draw game"
      : position.winner === "black"
        ? "Black wins!"
        : position.winner === "white"
          ? "White wins!"
          : "Game over"
  const status =
    flippingLabel ??
    result ??
    (step.type === "computer"
      ? "White is thinking"
      : position.lastPass
        ? formatPass(position.lastPass, position.turn)
        : formatTurn(position.turn))

  return (
    <GamePlayShell layout="board" game={game}>
      <GamePlaySection
        game={game}
        subtitle={modeLabel}
        headerDensity="compact"
        contentLayout="board"
        footer={
          <GamePlayFooterActions>
            <Button type="button" variant="outline" className="w-full" onClick={newGame}>
              New Game
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <PlatformLink href={gamePath(game.id)}>Back To Setup</PlatformLink>
            </Button>
          </GamePlayFooterActions>
        }
      >
        <div className="flex flex-col items-center">
          <p className="text-sm text-muted-foreground">
            Black {scores.black} · White {scores.white}
          </p>
          <p className="mt-1 text-sm font-medium" role="status">
            {status}
          </p>
          <div className="mt-4">
            <ReversiBoard
              position={display}
              onPlace={place}
              canPlay={step.type === "human" && flippingLabel === null}
              motion={motion}
            />
          </div>
        </div>
        <GamePostSolveDialog
          open={resultsOpen}
          onOpenChange={setResultsOpen}
          title={resultTitle}
          description={`Final score ${scores.black}–${scores.white}`}
          footer={
            <GamePostSolveActionStack>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setResultsOpen(false)
                  newGame()
                }}
              >
                New Game
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <PlatformLink href={`${gamePath(game.id)}/stats`}>
                  View Stats
                </PlatformLink>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setResultsOpen(false)}
              >
                Close
              </Button>
            </GamePostSolveActionStack>
          }
        />
      </GamePlaySection>
    </GamePlayShell>
  )
}
