import { applyMove, countDiscs, legalMoves } from "./position"
import type { Difficulty, Position, Side, Square } from "./types"
import { REVERSI_SIZE } from "./types"

const SEARCH_DEPTH: Record<Difficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
}

const EXACT_ENDGAME_EMPTIES = 6

/** Standard 8×8 positional weights. Corners are valuable. Squares beside a corner are poor. */
const WEIGHTS: readonly (readonly number[])[] = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, 1, 1, 1, 1, -2, 10],
  [5, -2, 1, 0, 0, 1, -2, 5],
  [5, -2, 1, 0, 0, 1, -2, 5],
  [10, -2, 1, 1, 1, 1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
]

export function chooseMove(position: Position, difficulty: Difficulty): Square {
  const moves = legalMoves(position)
  const first = moves[0]
  if (!first) {
    throw new Error("No legal move")
  }
  const empties = REVERSI_SIZE * REVERSI_SIZE - occupied(position)
  const depth =
    difficulty === "hard" && empties <= EXACT_ENDGAME_EMPTIES
      ? empties
      : SEARCH_DEPTH[difficulty]
  let best = first
  let bestScore = Number.NEGATIVE_INFINITY
  for (const move of moves) {
    const next = applyMove(position, move)
    if (!next) {
      continue
    }
    const score = search(
      next,
      depth - 1,
      position.turn,
      difficulty,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    )
    if (score > bestScore) {
      bestScore = score
      best = move
    }
  }
  return best
}

function search(
  position: Position,
  depth: number,
  rootSide: Side,
  difficulty: Difficulty,
  alpha: number,
  beta: number,
): number {
  if (position.status === "ended" || depth <= 0) {
    return evaluate(position, rootSide, difficulty)
  }
  const moves = legalMoves(position)
  if (moves.length === 0) {
    return evaluate(position, rootSide, difficulty)
  }
  const maximizing = position.turn === rootSide
  let best = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  let nextAlpha = alpha
  let nextBeta = beta
  for (const move of moves) {
    const next = applyMove(position, move)
    if (!next) {
      continue
    }
    const score = search(next, depth - 1, rootSide, difficulty, nextAlpha, nextBeta)
    if (maximizing) {
      best = Math.max(best, score)
      nextAlpha = Math.max(nextAlpha, best)
    } else {
      best = Math.min(best, score)
      nextBeta = Math.min(nextBeta, best)
    }
    if (nextBeta <= nextAlpha) {
      break
    }
  }
  return best
}

function evaluate(
  position: Position,
  rootSide: Side,
  difficulty: Difficulty,
): number {
  const { black, white } = countDiscs(position)
  const mine = rootSide === "black" ? black : white
  const theirs = rootSide === "black" ? white : black
  if (position.status === "ended" || difficulty === "easy") {
    return mine - theirs
  }
  let score = 0
  for (let row = 0; row < REVERSI_SIZE; row += 1) {
    for (let col = 0; col < REVERSI_SIZE; col += 1) {
      const disc = position.board[row]?.[col]
      if (!disc) {
        continue
      }
      const weight = WEIGHTS[row]?.[col] ?? 0
      score += disc === rootSide ? weight : -weight
    }
  }
  return score
}

function occupied(position: Position): number {
  const { black, white } = countDiscs(position)
  return black + white
}
