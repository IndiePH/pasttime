"use client"

import type { CSSProperties } from "react"

import {
  legalMoves,
  type Disc,
  type Position,
  type Square,
} from "@pasttime/domain/games/reversi"
import { cn } from "@/lib/utils"
import {
  REVERSI_FLIP_MS,
  REVERSI_PLACE_MS,
  type FlipMotion,
} from "@/features/games/reversi/hooks/flip-frames"

interface ReversiBoardProps {
  position: Position
  onPlace: (square: Square) => void
  canPlay: boolean
  motion?: FlipMotion | null
}

export function ReversiBoard({
  position,
  onPlace,
  canPlay,
  motion = null,
}: ReversiBoardProps) {
  const legal = new Set(
    canPlay
      ? legalMoves(position).map((square) => `${square.row},${square.col}`)
      : [],
  )

  return (
    <div
      className="grid grid-cols-8 gap-1 rounded-xl bg-[#2f6b3a] p-2"
      role="group"
      aria-label="Reversi board"
    >
      {position.board.map((row, rowIndex) =>
        row.map((disc, colIndex) => {
          const key = `${rowIndex},${colIndex}`
          const isLegal = legal.has(key)
          return (
            <button
              key={key}
              type="button"
              aria-label={squareLabel(position, rowIndex, colIndex, isLegal)}
              className="flex size-9 items-center justify-center overflow-hidden rounded-sm bg-[#3d8a4a] sm:size-11"
              onClick={() => {
                if (canPlay) {
                  onPlace({ row: rowIndex, col: colIndex })
                }
              }}
            >
              {disc ? (
                <DiscFace
                  disc={disc}
                  motion={motionHere(motion, rowIndex, colIndex)}
                />
              ) : isLegal ? (
                <span className="size-2 rounded-full bg-black/35" />
              ) : null}
            </button>
          )
        }),
      )}
    </div>
  )
}

function DiscFace({
  disc,
  motion,
}: {
  disc: Exclude<Disc, null>
  motion: FlipMotion | null
}) {
  const flipping = motion?.kind === "flip"
  return (
    <span
      className={cn(
        "size-7 rounded-full sm:size-8",
        flipping
          ? undefined
          : disc === "black"
            ? "bg-neutral-950"
            : "border border-neutral-300 bg-white",
      )}
      style={discMotionStyle(motion)}
    />
  )
}

function motionHere(
  motion: FlipMotion | null,
  row: number,
  col: number,
): FlipMotion | null {
  if (!motion || motion.square.row !== row || motion.square.col !== col) {
    return null
  }
  return motion
}

function discMotionStyle(motion: FlipMotion | null): CSSProperties | undefined {
  if (motion?.kind === "place") {
    return { animation: `reversi-disc-place ${REVERSI_PLACE_MS}ms ease-out` }
  }
  if (motion?.kind === "flip") {
    return {
      animation: `reversi-disc-flip ${REVERSI_FLIP_MS}ms linear forwards`,
      ["--reversi-from" as string]: discColor(motion.from),
      ["--reversi-to" as string]: discColor(motion.to),
    }
  }
  return undefined
}

function discColor(disc: Disc): string {
  return disc === "white" ? "#ffffff" : "#0a0a0a"
}

function squareLabel(
  position: Position,
  row: number,
  col: number,
  legal: boolean,
): string {
  const file = "abcdefgh"[col] ?? "?"
  const rank = 8 - row
  const disc = position.board[row]?.[col]
  const occupant =
    disc === "black" ? "Black" : disc === "white" ? "White" : "empty"
  return `${file}${rank}, ${occupant}${legal ? ", legal move" : ""}`
}
