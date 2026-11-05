import { describe, expect, it } from "vitest"

import {
  applyMove,
  countDiscs,
  createPosition,
  formatPass,
  formatResult,
  flippedSquares,
  formatTurn,
  legalMoves,
} from "./position"
import type { Disc, Position, Side } from "./types"

function playing(board: Disc[][], turn: Side): Position {
  return {
    board,
    turn,
    status: "playing",
    winner: null,
    lastPass: null,
  }
}

function emptyBoard(): Disc[][] {
  return Array.from({ length: 8 }, () => Array<Disc>(8).fill(null))
}

describe("createPosition", () => {
  it("starts with the center diagonal and Black to play", () => {
    const position = createPosition()

    expect(position.turn).toBe("black")
    expect(position.status).toBe("playing")
    expect(position.board[3][3]).toBe("white")
    expect(position.board[3][4]).toBe("black")
    expect(position.board[4][3]).toBe("black")
    expect(position.board[4][4]).toBe("white")
    expect(countDiscs(position)).toEqual({ black: 2, white: 2 })
    expect(legalMoves(position)).toEqual([
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
    ])
  })
})

describe("applyMove", () => {
  it("flips one line and gives the turn to White", () => {
    const next = applyMove(createPosition(), { row: 2, col: 3 })

    expect(next?.board[2][3]).toBe("black")
    expect(next?.board[3][3]).toBe("black")
    expect(next?.turn).toBe("white")
    expect(next?.status).toBe("playing")
    expect(next?.lastPass).toBeNull()
    expect(flippedSquares(createPosition(), { row: 2, col: 3 })).toEqual([
      { row: 3, col: 3 },
    ])
    expect(flippedSquares(createPosition(), { row: 0, col: 0 })).toEqual([])
  })

  it("flips every bracketed line", () => {
    const board = emptyBoard()
    board[0][0] = "black"
    board[0][1] = "white"
    board[1][2] = "white"
    board[2][2] = "black"
    board[7][1] = "black"
    board[7][2] = "white"

    const next = applyMove(playing(board, "black"), { row: 0, col: 2 })

    expect(next?.board[0][1]).toBe("black")
    expect(next?.board[0][2]).toBe("black")
    expect(next?.board[1][2]).toBe("black")
    expect(next?.status).toBe("playing")
    expect(next?.turn).toBe("white")
  })

  it("rejects an illegal square and leaves the caller position unchanged", () => {
    const position = createPosition()

    expect(applyMove(position, { row: 0, col: 0 })).toBeNull()
    expect(position.turn).toBe("black")
    expect(countDiscs(position)).toEqual({ black: 2, white: 2 })
  })

  it("passes when the other color has no move and this color still does", () => {
    const board = emptyBoard()
    board[2][0] = "black"
    board[2][1] = "white"
    board[0][6] = "white"
    board[0][7] = "black"

    const next = applyMove(playing(board, "black"), { row: 2, col: 2 })

    expect(next?.board[2][1]).toBe("black")
    expect(next?.board[2][2]).toBe("black")
    expect(next?.lastPass).toBe("white")
    expect(next?.turn).toBe("black")
    expect(next?.status).toBe("playing")
  })

  it("ends the match when the move leaves neither color a move", () => {
    const board = emptyBoard()
    board[0][6] = "white"
    board[0][7] = "black"

    const next = applyMove(playing(board, "black"), { row: 0, col: 5 })

    expect(next?.status).toBe("ended")
    expect(next?.winner).toBe("black")
    expect(countDiscs(next!)).toEqual({ black: 3, white: 0 })
    expect(formatResult(next!)).toBe("Black wins 3–0")
  })

  it("ends a full board in a draw when the counts are equal", () => {
    const board: Disc[][] = Array.from({ length: 8 }, () =>
      Array<Disc>(8).fill("white"),
    )
    board[0][0] = null
    board[0][1] = "white"
    board[0][2] = "black"
    let blacks = 1
    for (let row = 0; row < 8 && blacks < 30; row += 1) {
      for (let col = 0; col < 8 && blacks < 30; col += 1) {
        if (row === 0 && col <= 2) {
          continue
        }
        board[row][col] = "black"
        blacks += 1
      }
    }

    const next = applyMove(playing(board, "black"), { row: 0, col: 0 })

    expect(countDiscs(next!)).toEqual({ black: 32, white: 32 })
    expect(next?.status).toBe("ended")
    expect(next?.winner).toBe("draw")
    expect(formatResult(next!)).toBe("Draw 32–32")
  })
})

describe("result copy", () => {
  it("names the color to play and a passed color", () => {
    expect(formatTurn("black")).toBe("Black to play")
    expect(formatTurn("white")).toBe("White to play")
    expect(formatPass("white", "black")).toBe(
      "White has no move. Black to play.",
    )
  })
})
