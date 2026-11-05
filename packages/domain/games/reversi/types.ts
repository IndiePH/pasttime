export const REVERSI_SIZE = 8

export type Side = "black" | "white"
export type Disc = Side | null
export type Square = { row: number; col: number }
export type Difficulty = "easy" | "medium" | "hard"

export type ReversiMatchResult = "win" | "loss" | "draw"

export type ReversiMatch = {
  blackScore: number
  whiteScore: number
  result: ReversiMatchResult
  timestamp: number
}

export type ReversiStats = {
  wins: number
  losses: number
  draws: number
  totalGames: number
  winRate: number
  longestWinStreak: number
  biggestWinMargin: number | null
  averageScoreMargin: number | null
}

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
