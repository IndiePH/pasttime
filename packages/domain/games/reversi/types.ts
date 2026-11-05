export const REVERSI_SIZE = 8

export type Side = "black" | "white"
export type Disc = Side | null
export type Square = { row: number; col: number }
export type Difficulty = "easy" | "medium" | "hard"

export type Position = {
  board: Disc[][]
  turn: Side
  status: "playing" | "ended"
  winner: Side | "draw" | null
  lastPass: Side | null
}

export type Seat =
  | { kind: "human" }
  | { kind: "computer"; difficulty: Difficulty }

export type Session = {
  position: Position
  seats: Record<Side, Seat>
}

export type MoveChooser = (position: Position, difficulty: Difficulty) => Square

export type NextStep =
  | { type: "human" }
  | { type: "computer"; side: Side; difficulty: Difficulty }
  | { type: "ended" }
