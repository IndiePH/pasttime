import type { Disc, Position, Side, Square } from "./types"
import { REVERSI_SIZE } from "./types"

const DIRECTIONS: readonly Square[] = [
  { row: -1, col: -1 },
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
]

export function opponent(side: Side): Side {
  return side === "black" ? "white" : "black"
}

export function createPosition(): Position {
  const board = emptyBoard()
  board[3][3] = "white"
  board[3][4] = "black"
  board[4][3] = "black"
  board[4][4] = "white"
  return {
    board,
    turn: "black",
    status: "playing",
    winner: null,
    lastPass: null,
  }
}

export function legalMoves(position: Position): Square[] {
  if (position.status !== "playing") {
    return []
  }
  const moves: Square[] = []
  for (let row = 0; row < REVERSI_SIZE; row += 1) {
    for (let col = 0; col < REVERSI_SIZE; col += 1) {
      if (flipsFrom(position.board, row, col, position.turn).length > 0) {
        moves.push({ row, col })
      }
    }
  }
  return moves
}

export function flippedSquares(position: Position, square: Square): Square[] {
  if (position.status !== "playing" || !inBounds(square.row, square.col)) {
    return []
  }
  return flipsFrom(position.board, square.row, square.col, position.turn)
}

export function applyMove(position: Position, square: Square): Position | null {
  if (position.status !== "playing" || !inBounds(square.row, square.col)) {
    return null
  }
  const captured = flipsFrom(
    position.board,
    square.row,
    square.col,
    position.turn,
  )
  if (captured.length === 0) {
    return null
  }
  const board = cloneBoard(position.board)
  board[square.row][square.col] = position.turn
  for (const flip of captured) {
    board[flip.row][flip.col] = position.turn
  }
  return resolvePass({
    board,
    turn: opponent(position.turn),
    status: "playing",
    winner: null,
    lastPass: null,
  })
}

export function countDiscs(position: Position): { black: number; white: number } {
  let black = 0
  let white = 0
  for (const row of position.board) {
    for (const disc of row) {
      if (disc === "black") {
        black += 1
      } else if (disc === "white") {
        white += 1
      }
    }
  }
  return { black, white }
}

export function formatTurn(side: Side): string {
  return side === "black" ? "Black to play" : "White to play"
}

export function formatPass(passed: Side, toMove: Side): string {
  const passedName = sideName(passed)
  const toMoveName = sideName(toMove)
  return `${passedName} has no move. ${toMoveName} to play.`
}

export function formatResult(position: Position): string | null {
  if (position.status !== "ended" || position.winner === null) {
    return null
  }
  const { black, white } = countDiscs(position)
  const score = `${black}–${white}`
  if (position.winner === "draw") {
    return `Draw ${score}`
  }
  return `${sideName(position.winner)} wins ${score}`
}

function resolvePass(position: Position): Position {
  if (legalMoves(position).length > 0) {
    return position
  }
  const skipped = position.turn
  const passed: Position = {
    ...position,
    turn: opponent(skipped),
    lastPass: skipped,
  }
  if (legalMoves(passed).length > 0) {
    return passed
  }
  return withWinner(passed)
}

function withWinner(position: Position): Position {
  const { black, white } = countDiscs(position)
  return {
    ...position,
    status: "ended",
    winner: black === white ? "draw" : black > white ? "black" : "white",
  }
}

function flipsFrom(
  board: Disc[][],
  row: number,
  col: number,
  side: Side,
): Square[] {
  if (!inBounds(row, col) || board[row][col] !== null) {
    return []
  }
  const other = opponent(side)
  const flipped: Square[] = []
  for (const direction of DIRECTIONS) {
    const line: Square[] = []
    let nextRow = row + direction.row
    let nextCol = col + direction.col
    while (
      inBounds(nextRow, nextCol) &&
      board[nextRow]?.[nextCol] === other
    ) {
      line.push({ row: nextRow, col: nextCol })
      nextRow += direction.row
      nextCol += direction.col
    }
    if (
      line.length > 0 &&
      inBounds(nextRow, nextCol) &&
      board[nextRow]?.[nextCol] === side
    ) {
      flipped.push(...line)
    }
  }
  return flipped
}

function emptyBoard(): Disc[][] {
  return Array.from({ length: REVERSI_SIZE }, () =>
    Array.from({ length: REVERSI_SIZE }, () => null),
  )
}

function cloneBoard(board: Disc[][]): Disc[][] {
  return board.map((row) => row.slice())
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && col >= 0 && row < REVERSI_SIZE && col < REVERSI_SIZE
}

function sideName(side: Side): "Black" | "White" {
  return side === "black" ? "Black" : "White"
}
