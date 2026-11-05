import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { getGameById } from "@pasttime/domain/games"

import { GameHowToPlay } from "./game-how-to-play"

describe("GameHowToPlay", () => {
  it("includes the rules in the initial document", () => {
    const game = getGameById("sudoku")
    if (!game) {
      throw new Error("missing sudoku")
    }
    render(<GameHowToPlay game={game} />)
    expect(document.body.textContent).toContain("How To Play")
    expect(document.body.textContent).toContain(
      "Fill every row, column, and 3×3 box",
    )
  })

  it("stays off coming-soon games", () => {
    const game = getGameById("tongits")
    if (!game) {
      throw new Error("missing tongits")
    }
    const { container } = render(<GameHowToPlay game={game} />)
    expect(container).toBeEmptyDOMElement()
  })
})
