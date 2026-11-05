import type { Disc, Square } from "@pasttime/domain/games/reversi"

export const REVERSI_PLACE_MS = 160
export const REVERSI_FLIP_MS = 280
export const REVERSI_THINK_MS = 280

export interface FlipMotion {
  square: Square
  kind: "place" | "flip"
  from: Disc
  to: Exclude<Disc, null>
}

export interface FlipFrame {
  board: Disc[][]
  motion: FlipMotion
}

export function flipFrames(
  board: Disc[][],
  placed: Square,
  side: Exclude<Disc, null>,
  flips: readonly Square[],
): FlipFrame[] {
  const ordered = [...flips].sort((a, b) => {
    const da = Math.abs(a.row - placed.row) + Math.abs(a.col - placed.col)
    const db = Math.abs(b.row - placed.row) + Math.abs(b.col - placed.col)
    if (da !== db) {
      return da - db
    }
    if (a.row !== b.row) {
      return a.row - b.row
    }
    return a.col - b.col
  })

  let current = withDisc(board, placed, side)
  const frames: FlipFrame[] = [
    {
      board: current,
      motion: { square: placed, kind: "place", from: null, to: side },
    },
  ]
  for (const square of ordered) {
    const from = current[square.row]?.[square.col] ?? null
    current = withDisc(current, square, side)
    frames.push({
      board: current,
      motion: { square, kind: "flip", from, to: side },
    })
  }
  return frames
}

function withDisc(board: Disc[][], square: Square, disc: Disc): Disc[][] {
  return board.map((row, rowIndex) =>
    rowIndex === square.row
      ? row.map((cell, colIndex) => (colIndex === square.col ? disc : cell))
      : row,
  )
}
