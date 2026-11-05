import { describe, expect, it } from "vitest"

import { chooseMove } from "./computer"
import { applyMove, createPosition, legalMoves } from "./position"
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

describe("chooseMove", () => {
  it("returns a legal opening move", () => {
    const move = chooseMove(createPosition(), "medium")
    expect(legalMoves(createPosition())).toContainEqual(move)
  })

  it("plays the only legal square", () => {
    const board = emptyBoard()
    board[0][1] = "black"
    board[0][2] = "white"
    const position = playing(board, "white")

    expect(chooseMove(position, "easy")).toEqual({ row: 0, col: 0 })
    expect(chooseMove(position, "hard")).toEqual({ row: 0, col: 0 })
  })

  it("lets Easy take the larger capture and Medium keep the corner", () => {
    const board = emptyBoard()
    board[0][4] = "black"
    board[0][5] = "black"
    board[0][6] = "black"
    board[0][7] = "white"
    board[7][1] = "black"
    board[7][2] = "white"
    const position = playing(board, "white")

    expect(chooseMove(position, "easy")).toEqual({ row: 0, col: 3 })
    expect(chooseMove(position, "medium")).toEqual({ row: 7, col: 0 })
    expect(chooseMove(position, "hard")).toEqual({ row: 7, col: 0 })
  })

  it("answers a human opening through the same move function", () => {
    const afterHuman = applyMove(createPosition(), { row: 2, col: 3 })
    const reply = chooseMove(afterHuman!, "easy")

    expect(legalMoves(afterHuman!)).toContainEqual(reply)
  })
})
