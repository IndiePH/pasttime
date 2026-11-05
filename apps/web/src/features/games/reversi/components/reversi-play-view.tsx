"use client"

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
  const step = nextStep(session)
  const scores = countDiscs(display)
  const result = formatResult(position)
  const status =
    flippingLabel ??
    result ??
    (step.type === "computer"
      ? "White is thinking"
      : position.lastPass
        ? formatPass(position.lastPass, position.turn)
        : formatTurn(position.turn))

  return (
    <GamePlayShell layout="board">
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
      </GamePlaySection>
    </GamePlayShell>
  )
}
