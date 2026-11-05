import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"

import { ReversiPlayView } from "./reversi-play-view"

const GAME: GameDefinition = {
  id: "reversi",
  title: "Reversi",
  description: "Capture territory by surrounding and flipping enemy tiles.",
  status: "available",
  icon: "reversi",
  tags: ["board", "strategy"],
  playerCount: "1 player",
}

describe("ReversiPlayView", () => {
  afterEach(() => {
    cleanup()
  })

  it("flips a disc and lets the computer answer", async () => {
    render(<ReversiPlayView game={GAME} modeLabel="Solo play" />)

    fireEvent.click(screen.getByRole("button", { name: "d6, empty, legal move" }))

    expect(screen.getByRole("status")).toHaveTextContent("Black is flipping")
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Black to play")
    }, { timeout: 3000 })
    expect(screen.getByText(/White [2-9]/)).toBeTruthy()
    expect(screen.getByRole("button", { name: "d6, Black" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "c6, White" })).toBeTruthy()
  })

  it("leaves the board unchanged after an illegal click", () => {
    render(<ReversiPlayView game={GAME} modeLabel="Solo play" />)

    fireEvent.click(screen.getByRole("button", { name: "a1, empty" }))

    expect(screen.getByRole("status")).toHaveTextContent("Black to play")
    expect(screen.getByRole("button", { name: "d5, White" })).toBeTruthy()
  })

  it("starts with flip animation on", () => {
    render(<ReversiPlayView game={GAME} modeLabel="Solo play" />)

    fireEvent.click(screen.getByRole("button", { name: /Settings/ }))

    expect(screen.getByRole("switch", { name: "Animate Flips" })).toHaveAttribute(
      "aria-checked",
      "true",
    )
  })

  it("starts over when New Game is pressed", async () => {
    render(<ReversiPlayView game={GAME} modeLabel="Solo play" />)
    fireEvent.click(screen.getByRole("button", { name: "d6, empty, legal move" }))
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Black to play")
    }, { timeout: 3000 })

    fireEvent.click(screen.getByRole("button", { name: "New Game" }))

    expect(screen.getByRole("status")).toHaveTextContent("Black to play")
    expect(screen.getByRole("button", { name: "d5, White" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "d6, empty, legal move" })).toBeTruthy()
  })
})
