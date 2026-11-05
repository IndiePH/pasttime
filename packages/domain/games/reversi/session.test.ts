import { describe, expect, it } from "vitest"

import { createPosition } from "./position"
import {
  acceptHumanMove,
  applyComputerMove,
  createComputerSession,
  createHotseatSession,
  createSession,
  nextStep,
  setComputerDifficulty,
} from "./session"

describe("reversi seats", () => {
  it("lets one hotseat session place both colors", () => {
    const blackMove = acceptHumanMove(createHotseatSession(), {
      row: 2,
      col: 3,
    })
    const whiteMove = acceptHumanMove(blackMove!, { row: 2, col: 2 })

    expect(blackMove?.position.turn).toBe("white")
    expect(whiteMove?.position.board[2][2]).toBe("white")
    expect(whiteMove?.position.turn).toBe("black")
    expect(nextStep(createHotseatSession())).toEqual({ type: "human" })
  })

  it("rejects a human click while a computer seat is to move", () => {
    const session = createSession({
      black: { kind: "computer", difficulty: "medium" },
      white: { kind: "human" },
    })

    expect(acceptHumanMove(session, { row: 2, col: 3 })).toBeNull()
    expect(session.position).toEqual(createPosition())
    expect(nextStep(session)).toEqual({
      type: "computer",
      side: "black",
      difficulty: "medium",
    })
  })

  it("places a computer move and rejects one on a human seat", () => {
    const computer = createSession({
      black: { kind: "computer", difficulty: "easy" },
      white: { kind: "human" },
    })
    const placed = applyComputerMove(computer, { row: 2, col: 3 })

    expect(placed?.position.board[2][3]).toBe("black")
    expect(placed?.position.board[3][3]).toBe("black")
    expect(applyComputerMove(createHotseatSession(), { row: 2, col: 3 })).toBeNull()
  })

  it("gives White to the computer and keeps the chosen difficulty", () => {
    const session = createComputerSession("easy")

    expect(session.seats.black).toEqual({ kind: "human" })
    expect(session.seats.white).toEqual({
      kind: "computer",
      difficulty: "easy",
    })
    expect(nextStep(session)).toEqual({ type: "human" })
    expect(setComputerDifficulty(session, "hard").seats.white).toEqual({
      kind: "computer",
      difficulty: "hard",
    })
  })

  it("reports an ended match before either seat", () => {
    const session = createHotseatSession()
    session.position = {
      ...session.position,
      status: "ended",
      winner: "draw",
    }

    expect(nextStep(session)).toEqual({ type: "ended" })
    expect(acceptHumanMove(session, { row: 2, col: 3 })).toBeNull()
  })
})
